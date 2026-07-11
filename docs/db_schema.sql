-- Supabase database schema setup for Player Accounts, Messaging, & Announcements

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  university text,
  faculty text,
  department text,
  level text,
  chess_username text,
  lichess_username text,
  chess_rating integer default 0,
  lichess_rating integer default 0,
  last_rating_sync timestamp with time zone,
  role text default 'player',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profiles" on public.profiles
  for update using (auth.uid() = id);

-- 2. Match Messages Table
create table if not exists public.match_messages (
  id uuid default gen_random_uuid() primary key,
  match_id text not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.match_messages enable row level security;

create policy "Anyone can view match messages" on public.match_messages
  for select using (true);

create policy "Authenticated users can insert match messages" on public.match_messages
  for insert with check (auth.uid() = sender_id);

-- 3. Direct Messages Table
create table if not exists public.direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.direct_messages enable row level security;

create policy "Users can view messages sent to or by them" on public.direct_messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages as themselves" on public.direct_messages
  for insert with check (auth.uid() = sender_id);

-- 4. Announcements Table
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.announcements enable row level security;

create policy "Announcements are viewable by everyone" on public.announcements
  for select using (true);

create policy "Only admins can insert announcements" on public.announcements
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5. Awards Table
create table if not exists public.awards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  award_type text not null,
  tournament_id text not null,
  awarded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, award_type, tournament_id)
);

alter table public.awards enable row level security;

create policy "Awards are viewable by everyone" on public.awards
  for select using (true);

-- 6. Verified Games Table
create table if not exists public.verified_games (
  id uuid default gen_random_uuid() primary key,
  match_id text not null unique,
  platform text not null,
  game_url text not null,
  winner_username text,
  is_admin_approved boolean default false,
  extracted_stats jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.verified_games enable row level security;

create policy "Verified games are viewable by everyone" on public.verified_games
  for select using (true);

create policy "Only admins can modify verified games" on public.verified_games
  for all using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );
