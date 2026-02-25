-- Create a table for tasks
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  priority text check (priority in ('low', 'medium', 'high')) not null,
  completed boolean default false not null,
  date text not null,     -- YYYY-MM-DD
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table tasks enable row level security;

-- Create policies so users can only see and manage their own tasks
create policy "Users can insert their own tasks." on tasks for insert with check (auth.uid() = user_id);
create policy "Users can view their own tasks." on tasks for select using (auth.uid() = user_id);
create policy "Users can update their own tasks." on tasks for update using (auth.uid() = user_id);
create policy "Users can delete their own tasks." on tasks for delete using (auth.uid() = user_id);
