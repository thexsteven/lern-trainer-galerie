create schema if not exists private;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name) <= 80),
  course text check (course is null or course = 'T-INF 25'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  trainer_id text not null,
  lesson_id text not null default 'state',
  value text,
  revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, trainer_id, lesson_id)
);

create table public.user_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text,
  revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table public.quiz_results (
  user_id uuid not null references auth.users(id) on delete cascade,
  trainer_id text not null,
  quiz_id text not null,
  score numeric,
  max_score numeric,
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, trainer_id, quiz_id)
);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.user_settings enable row level security;
alter table public.quiz_results enable row level security;

grant select, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.progress, public.user_settings, public.quiz_results to authenticated;
revoke all on public.profiles, public.progress, public.user_settings, public.quiz_results from anon;

create policy own_profile_read on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy own_profile_update on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_profile_delete on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);
create policy own_progress on public.progress for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_settings on public.user_settings for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_quizzes on public.quiz_results for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function private.create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, course)
  values (new.id, case when new.raw_user_meta_data->>'course' = 'T-INF 25' then 'T-INF 25' else null end);
  return new;
end;
$$;
revoke all on function private.create_profile() from public, anon, authenticated;
create trigger create_user_profile after insert on auth.users for each row execute function private.create_profile();

-- Authorization uses the live, confirmed Auth identity, never editable user_metadata.
create function private.has_private_access() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.users where id = (select auth.uid())
    and lower(email) = 'steven7braun@gmail.com' and email_confirmed_at is not null);
$$;
revoke all on function private.has_private_access() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.has_private_access() to authenticated;
create function public.has_private_access() returns boolean language sql stable security invoker set search_path = '' as $$
  select private.has_private_access();
$$;
revoke all on function public.has_private_access() from public, anon;
grant execute on function public.has_private_access() to authenticated;

-- Compare revisions under a row lock; an offline browser must never silently replace newer cloud data.
create function public.save_learning_state(p_key text, p_value text, p_revision bigint, p_quizzes jsonb default '[]')
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  current_revision bigint;
  current_value text;
  quiz jsonb;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if length(p_key) > 180 or length(p_value) > 3000000 or p_revision < 0
    or not (p_key in ('lern-trainer-personal-v1', 'lern-trainer-learning-control-v1', 'lern-trainer-angewandte-mathe-v1',
      'lern-trainer-angewandte-mathe-v1-backup-before-control', 'lern-trainer-database-progress-v1', 'appjs-level-quest-v1', 'fsa-lernreise-v1')
      or p_key like 'fsa-cheatsheet-note-v1:%') then raise exception 'Invalid learning state'; end if;
  if p_key = 'lern-trainer-personal-v1' then
    insert into public.user_settings(user_id, key) values(uid, p_key) on conflict do nothing;
    select revision, value into current_revision, current_value from public.user_settings where user_id = uid and key = p_key for update;
  else
    insert into public.progress(user_id, trainer_id) values(uid, p_key) on conflict do nothing;
    select revision, value into current_revision, current_value from public.progress where user_id = uid and trainer_id = p_key and lesson_id = 'state' for update;
  end if;
  if current_revision <> p_revision then
    return jsonb_build_object('accepted', false, 'current', jsonb_build_object('value', current_value, 'revision', current_revision));
  end if;
  if p_key = 'lern-trainer-personal-v1' then
    update public.user_settings set value = p_value, revision = revision + 1, updated_at = now() where user_id = uid and key = p_key;
  else
    update public.progress set value = p_value, revision = revision + 1, updated_at = now() where user_id = uid and trainer_id = p_key and lesson_id = 'state';
  end if;
  for quiz in select * from jsonb_array_elements(p_quizzes) loop
    insert into public.quiz_results(user_id, trainer_id, quiz_id, score, max_score, result)
    values(uid, quiz->>'trainer_id', quiz->>'quiz_id', (quiz->>'score')::numeric, (quiz->>'max_score')::numeric, quiz->'result')
    on conflict(user_id, trainer_id, quiz_id) do update set score = excluded.score, max_score = excluded.max_score, result = excluded.result;
  end loop;
  return jsonb_build_object('accepted', true, 'revision', current_revision + 1);
end;
$$;
revoke all on function public.save_learning_state(text, text, bigint, jsonb) from public, anon;
grant execute on function public.save_learning_state(text, text, bigint, jsonb) to authenticated;
