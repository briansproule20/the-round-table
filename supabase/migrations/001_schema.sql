-- The Camelot Quiz schema

create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  avatar_url text,
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  correct_index smallint not null check (correct_index >= 0 and correct_index <= 3),
  "order" smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(member_id, "order")
);

create table scores (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null,
  player_name text not null,
  member_id uuid not null references members(id) on delete cascade,
  score smallint not null check (score >= 0 and score <= 5),
  answers jsonb not null,
  created_at timestamptz not null default now(),
  unique(player_id, member_id)
);

-- RLS
alter table members enable row level security;
alter table questions enable row level security;
alter table scores enable row level security;

create policy "Members are publicly readable"
  on members for select using (true);

create policy "Questions are publicly readable"
  on questions for select using (true);

create policy "Scores are publicly readable"
  on scores for select using (true);

create policy "Anyone can insert scores"
  on scores for insert with check (true);

create policy "Anyone can update their own scores"
  on scores for update using (true);
