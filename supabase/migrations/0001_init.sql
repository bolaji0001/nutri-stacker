-- Nutri-Stacker initial schema
-- Run this in the Supabase SQL editor (or via the CLI) after creating a project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  goal text check (goal in ('lose_weight', 'maintain', 'build_muscle')),
  diet_type text not null default 'none',
  allergies text[] not null default '{}',
  disliked_foods text[] not null default '{}',
  calorie_target integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  meals_per_day integer not null default 3 check (meals_per_day between 1 and 6),
  cooking_time_minutes integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date,
  days integer not null default 1,
  status text not null default 'generating'
    check (status in ('generating', 'ready', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.meal_plans (id) on delete cascade,
  day_index integer not null check (day_index >= 0),
  slot text not null check (slot in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  minutes integer,
  steps text[] not null default '{}',
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals (id) on delete cascade,
  ingredient_name text not null,
  grams numeric not null check (grams > 0),
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric
);

create index if not exists meal_plans_user_id_idx on public.meal_plans (user_id, created_at desc);
create index if not exists meals_plan_id_idx on public.meals (plan_id, day_index, slot);
create index if not exists meal_items_meal_id_idx on public.meal_items (meal_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists meal_plans_set_updated_at on public.meal_plans;
create trigger meal_plans_set_updated_at
  before update on public.meal_plans
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can read own meal plans"
  on public.meal_plans for select
  using (auth.uid() = user_id);

create policy "Users can read meals on own plans"
  on public.meals for select
  using (
    exists (
      select 1 from public.meal_plans
      where public.meal_plans.id = meals.plan_id
        and public.meal_plans.user_id = auth.uid()
    )
  );

create policy "Users can read items on own meals"
  on public.meal_items for select
  using (
    exists (
      select 1
      from public.meals
      join public.meal_plans on public.meal_plans.id = public.meals.plan_id
      where public.meals.id = meal_items.meal_id
        and public.meal_plans.user_id = auth.uid()
    )
  );
