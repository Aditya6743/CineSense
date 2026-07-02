-- Run this in your Supabase SQL Editor to create the watched_movies table

create table watched_movies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  movie_id integer not null,
  movie_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, movie_id)
);

-- Set up Row Level Security (RLS)
alter table watched_movies enable row level security;

-- Create Policy: Users can only see their own watched history
create policy "Users can view their own watched movies" on watched_movies
  for select using (auth.uid() = user_id);

-- Create Policy: Users can insert their own watched history
create policy "Users can insert their own watched movies" on watched_movies
  for insert with check (auth.uid() = user_id);

-- Create Policy: Users can delete their own watched history
create policy "Users can delete their own watched movies" on watched_movies
  for delete using (auth.uid() = user_id);
