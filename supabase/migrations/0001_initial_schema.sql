-- Swivy — schéma initial.
-- Modèle universel : la décoration est la première niche, mais le couple
-- attributes / attribute_values permet d'ajouter mode, sneakers, bijoux…
-- sans migration de structure.

create extension if not exists vector;

-- ————————————————————————————————————————————————————————————————
-- Utilisateurs
-- ————————————————————————————————————————————————————————————————

-- La table users est gérée par Supabase Auth (auth.users).
-- profiles porte les métadonnées applicatives.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ————————————————————————————————————————————————————————————————
-- Catalogue
-- ————————————————————————————————————————————————————————————————

create table public.merchants (
  id text primary key,
  name text not null,
  domain text not null,
  shipping_info text
);

create table public.categories (
  id text primary key, -- slug ("canapes", "sneakers-basses"…)
  label text not null,
  parent_id text references public.categories (id),
  -- Univers produit : "decoration" aujourd'hui, "mode", "sneakers"… demain.
  universe text not null default 'decoration'
);

create table public.products (
  id text primary key,
  name text not null,
  brand text not null,
  price numeric(10, 2) not null check (price > 0),
  previous_price numeric(10, 2),
  currency text not null default 'EUR',
  category_id text not null references public.categories (id),
  description text not null,
  dimensions text,
  merchant_id text not null references public.merchants (id),
  url text not null,
  in_stock boolean not null default true,
  popularity real not null default 0.5 check (popularity between 0 and 1),
  boldness real not null default 0.5 check (boldness between 0 and 1),
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
create index products_price_idx on public.products (price);

create table public.product_images (
  id bigint generated always as identity primary key,
  product_id text not null references public.products (id) on delete cascade,
  url text not null,
  position int not null default 0
);

create index product_images_product_idx on public.product_images (product_id);

-- Attributs universels : color, material, style, shape, room, price_band,
-- badge, audience, usage, fit, movement, finish…
create table public.attributes (
  id text primary key,
  label text not null
);

create table public.attribute_values (
  id text primary key, -- "style:japandi", "color:vert sauge"
  attribute_id text not null references public.attributes (id) on delete cascade,
  value text not null,
  label text not null,
  unique (attribute_id, value)
);

create table public.product_attribute_values (
  product_id text not null references public.products (id) on delete cascade,
  attribute_value_id text not null references public.attribute_values (id) on delete cascade,
  primary key (product_id, attribute_value_id)
);

create index pav_attribute_value_idx on public.product_attribute_values (attribute_value_id);

-- ————————————————————————————————————————————————————————————————
-- Signaux utilisateurs
-- ————————————————————————————————————————————————————————————————

create table public.swipes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  action text not null check (action in ('like', 'dislike', 'superlike')),
  source text not null default 'discovery' check (source in ('discovery', 'calibration', 'similar')),
  created_at timestamptz not null default now()
);

create index swipes_user_idx on public.swipes (user_id, created_at desc);

create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  superlike boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.collection_products (
  collection_id uuid not null references public.collections (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

-- ————————————————————————————————————————————————————————————————
-- Recommandation & mesure
-- ————————————————————————————————————————————————————————————————

create table public.recommendation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  context text not null default 'discovery'
);

create table public.recommendation_impressions (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.recommendation_sessions (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  position int not null,
  -- Tranche du mélange d'exploration : compatible / adjacent / experimental.
  tier text not null check (tier in ('top', 'mid', 'wild')),
  shown_at timestamptz not null default now()
);

create table public.product_clicks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  kind text not null check (kind in ('details', 'merchant', 'similar')),
  created_at timestamptz not null default now()
);

-- Poids appris par attribut (miroir serveur du profil de goût local).
create table public.user_preference_scores (
  user_id uuid not null references auth.users (id) on delete cascade,
  attribute_value_id text not null references public.attribute_values (id) on delete cascade,
  score real not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, attribute_value_id)
);

-- Profil visuel (pgvector) : embedding moyen des produits aimés,
-- pour la similarité visuelle produit ↔ utilisateur.
create table public.user_visual_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  embedding vector(512),
  updated_at timestamptz not null default now()
);

-- Embeddings produits (remplis hors-ligne par un pipeline d'images).
alter table public.products add column embedding vector(512);
create index products_embedding_idx on public.products
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ————————————————————————————————————————————————————————————————
-- Row Level Security
-- ————————————————————————————————————————————————————————————————

-- Catalogue : lecture publique, écriture réservée au service role.
alter table public.merchants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.attributes enable row level security;
alter table public.attribute_values enable row level security;
alter table public.product_attribute_values enable row level security;

create policy "catalog readable" on public.merchants for select using (true);
create policy "catalog readable" on public.categories for select using (true);
create policy "catalog readable" on public.products for select using (true);
create policy "catalog readable" on public.product_images for select using (true);
create policy "catalog readable" on public.attributes for select using (true);
create policy "catalog readable" on public.attribute_values for select using (true);
create policy "catalog readable" on public.product_attribute_values for select using (true);

-- Données personnelles : chacun chez soi.
alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.favorites enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.recommendation_sessions enable row level security;
alter table public.recommendation_impressions enable row level security;
alter table public.product_clicks enable row level security;
alter table public.user_preference_scores enable row level security;
alter table public.user_visual_profiles enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own swipes" on public.swipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own favorites" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own collections" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own collection products" on public.collection_products
  for all using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );
create policy "own sessions" on public.recommendation_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own impressions" on public.recommendation_impressions
  for all using (
    exists (
      select 1 from public.recommendation_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
create policy "own clicks" on public.product_clicks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own preference scores" on public.user_preference_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own visual profile" on public.user_visual_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Création automatique du profil applicatif à l'inscription.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
