-- Create a table for public user profiles (links to Supabase Auth users)
create table public.users (
  id uuid references auth.users not null primary key,
  username text,
  avatar_url text,
  level int default 1,
  current_exp int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for user stats (Hexagon Stats)
create table public.user_stats (
  user_id uuid references public.users(id) not null primary key,
  strength int default 10,
  intelligence int default 10,
  charisma int default 10,
  creativity int default 10,
  wisdom int default 10,
  wealth int default 10,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for activity logs (Journal + AI Analysis)
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  description text not null,
  ai_analysis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.user_stats enable row level security;
alter table public.activity_logs enable row level security;

-- Create policies (Simplistic policies for prototype: Users can read/write their own data)
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);
create policy "Users can view their own stats" on public.user_stats
  for select using (auth.uid() = user_id);
create policy "Users can update their own stats" on public.user_stats
  for update using (auth.uid() = user_id);
create policy "Users can insert their own stats" on public.user_stats
  for insert with check (auth.uid() = user_id);
create policy "Users can view their own logs" on public.activity_logs
  for select using (auth.uid() = user_id);
create policy "Users can insert their own logs" on public.activity_logs
  for insert with check (auth.uid() = user_id);

-- Function to handle new user creation (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  insert into public.user_stats (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();