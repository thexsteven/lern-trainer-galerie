create or replace function private.has_private_access() returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_live_session() and exists(select 1 from auth.users where id = (select auth.uid())
    and lower(email) = 'stevenbraun3107@icloud.com' and email_confirmed_at is not null);
$$;
