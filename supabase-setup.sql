-- Execute this script in your Supabase SQL Editor

-- 1. Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  first_name text,
  last_name text,
  avatar_url text
);

-- 2. Create posts table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Posts Policies
create policy "Posts are viewable by everyone." on posts
  for select using (true);

create policy "Authenticated users can create posts." on posts
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own posts." on posts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own posts." on posts
  for delete using (auth.uid() = user_id);

-- Comments Policies
create policy "Comments are viewable by everyone." on comments
  for select using (true);

create policy "Authenticated users can create comments." on comments
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own comments." on comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments." on comments
  for delete using (auth.uid() = user_id);

-- Enable Realtime for tables (Required for live updates on posts and comments)
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table comments;
