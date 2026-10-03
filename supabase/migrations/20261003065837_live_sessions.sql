create function private.has_live_session() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.sessions where user_id = (select auth.uid())
    and id::text = (select auth.jwt()->>'session_id'));
$$;
revoke all on function private.has_live_session() from public, anon;
grant execute on function private.has_live_session() to authenticated;
create function public.has_live_session() returns boolean language sql stable security invoker set search_path = '' as $$
  select private.has_live_session();
$$;
revoke all on function public.has_live_session() from public, anon;
grant execute on function public.has_live_session() to authenticated;

create or replace function private.has_private_access() returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_live_session() and exists(select 1 from auth.users where id = (select auth.uid())
    and lower(email) = 'steven7braun@gmail.com' and email_confirmed_at is not null);
$$;

create policy live_profile_session on public.profiles as restrictive for all to authenticated using ((select private.has_live_session())) with check ((select private.has_live_session()));
create policy live_progress_session on public.progress as restrictive for all to authenticated using ((select private.has_live_session())) with check ((select private.has_live_session()));
create policy live_settings_session on public.user_settings as restrictive for all to authenticated using ((select private.has_live_session())) with check ((select private.has_live_session()));
create policy live_quiz_session on public.quiz_results as restrictive for all to authenticated using ((select private.has_live_session())) with check ((select private.has_live_session()));
