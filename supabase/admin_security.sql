-- POPUP.NYC admin authorization layer.
-- Run once in the Supabase SQL editor as the database owner.

alter table public.profiles
  add column if not exists is_superadmin boolean not null default false;

-- Bootstrap the first administrator from the already authenticated owner account.
-- Further admins should be promoted deliberately in the Supabase dashboard.
update public.profiles
set is_superadmin = true
where id = 'e17cf9b8-2c96-4877-ad64-e823f941b36f';

create or replace function public.is_superadmin(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select p.is_superadmin
    from public.profiles p
    where p.id = check_user_id
  ), false);
$$;

revoke all on function public.is_superadmin(uuid) from public;
grant execute on function public.is_superadmin(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.ai_generations enable row level security;
alter table public.votes enable row level security;

drop policy if exists "superadmins read all profiles" on public.profiles;
create policy "superadmins read all profiles"
on public.profiles for select to authenticated
using (public.is_superadmin(auth.uid()));

drop policy if exists "superadmins manage all generations" on public.ai_generations;
create policy "superadmins manage all generations"
on public.ai_generations for all to authenticated
using (public.is_superadmin(auth.uid()))
with check (public.is_superadmin(auth.uid()));

drop policy if exists "superadmins read all votes" on public.votes;
create policy "superadmins read all votes"
on public.votes for select to authenticated
using (public.is_superadmin(auth.uid()));

grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.ai_generations to authenticated;
grant select on public.votes to authenticated;
