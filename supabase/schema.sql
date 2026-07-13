-- =============================================
-- LUXE - Luxury Fashion Store Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can update any profile" on public.profiles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- CATEGORIES
-- =============================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are publicly readable" on public.categories
  for select using (true);

create policy "Only admins can manage categories" on public.categories
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- =============================================
-- PRODUCTS
-- =============================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null default 0,
  compare_price numeric(12,2),
  images text[] not null default '{}',
  category_id uuid references public.categories(id) on delete set null,
  stock integer not null default 0,
  sku text,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  featured boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Active products are publicly readable" on public.products
  for select using (status = 'active' or (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  ));

create policy "Only admins can manage products" on public.products
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.update_updated_at();

-- =============================================
-- ORDERS
-- =============================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text not null check (payment_method in ('stripe','vnpay','momo','cod')),
  subtotal numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  shipping_address jsonb not null,
  notes text,
  stripe_payment_intent_id text,
  campaign_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id or (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  ));

create policy "Anyone can create orders" on public.orders
  for insert with check (true);

create policy "Admins can update orders" on public.orders
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.update_updated_at();

-- =============================================
-- ORDER ITEMS
-- =============================================
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  price numeric(12,2) not null,
  product_name text not null,
  product_image text
);

alter table public.order_items enable row level security;

create policy "Order items follow order visibility" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
      and (o.user_id = auth.uid() or
        exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      )
    )
  );

create policy "Anyone can insert order items" on public.order_items
  for insert with check (true);

-- =============================================
-- CAMPAIGNS / PROMOTIONS
-- =============================================
create table public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  type text not null check (type in ('percentage','fixed','free_shipping','bogo')),
  value numeric(12,2) not null default 0,
  code text unique,
  min_order_value numeric(12,2) not null default 0,
  max_uses integer,
  uses_count integer not null default 0,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  status text not null default 'active' check (status in ('active','inactive','expired')),
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "Active campaigns are publicly readable" on public.campaigns
  for select using (status = 'active' or (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  ));

create policy "Only admins can manage campaigns" on public.campaigns
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- =============================================
-- STORE SETTINGS
-- =============================================
create table public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'LUXE',
  logo_url text,
  favicon_url text,
  banner_url text,
  banner_text text,
  primary_color text not null default '#1a1a1a',
  secondary_color text not null default '#c9a96e',
  accent_color text not null default '#f5f0e8',
  font_heading text not null default 'Playfair Display',
  font_body text not null default 'Inter',
  hero_title text not null default 'Luxury Redefined',
  hero_subtitle text not null default 'Discover timeless elegance in every piece',
  hero_image_url text,
  contact_email text,
  contact_phone text,
  address text,
  social_instagram text,
  social_facebook text,
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

create policy "Store settings are publicly readable" on public.store_settings
  for select using (true);

create policy "Only admins can update settings" on public.store_settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Insert default settings
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- =============================================
-- SEED DATA (demo products & categories)
-- =============================================
insert into public.categories (name, slug, description) values
  ('Áo', 'ao', 'Áo luxury cao cấp'),
  ('Quần', 'quan', 'Quần cao cấp'),
  ('Đầm & Váy', 'dam-vay', 'Đầm và váy luxury'),
  ('Phụ Kiện', 'phu-kien', 'Phụ kiện thời trang'),
  ('Set', 'set', 'Set đồ luxury')
on conflict (slug) do nothing;
