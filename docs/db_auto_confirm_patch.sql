-- SCL Auth Patch: Auto-confirm email on signup
-- Run once in the Supabase SQL Editor.
-- This removes the email-verification step entirely — users can sign up
-- and sign in immediately with no inbox check.

create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  update auth.users
  set email_confirmed_at = now()
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.auto_confirm_user();
