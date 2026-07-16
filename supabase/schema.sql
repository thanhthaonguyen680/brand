-- =============================================
-- KHA - Luxury Fashion Store Database Schema
-- Run this once in the Supabase SQL Editor to set up a fresh project.
-- This file is the consolidated, up-to-date schema — it already includes
-- every change that used to live in separate supabase/migration_*.sql
-- files. Those files are kept around only to upgrade a database that was
-- set up before a given feature existed; a fresh project does not need them.
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
  sizes jsonb not null default '[]'::jsonb,
  sku text,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  featured boolean not null default false,
  is_new boolean not null default false,
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

-- Decrement total stock on checkout (bypasses RLS since customers aren't admins)
create or replace function public.decrement_stock(p_product_id uuid, p_quantity int)
returns void as $$
begin
  update public.products
  set stock = greatest(0, stock - p_quantity)
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- Decrement stock for one size within products.sizes, e.g. [{"size": "S", "stock": 10}]
create or replace function public.decrement_size_stock(p_product_id uuid, p_size text, p_quantity int)
returns void as $$
begin
  update public.products
  set sizes = (
    select coalesce(jsonb_agg(
      case when elem->>'size' = p_size
        then jsonb_set(elem, '{stock}', to_jsonb(greatest(0, (elem->>'stock')::int - p_quantity)))
        else elem
      end
    ), '[]'::jsonb)
    from jsonb_array_elements(sizes) elem
  )
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- =============================================
-- ORDERS
-- =============================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text not null check (payment_method in ('bank_transfer','paypal','cod')),
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
  product_image text,
  size text
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
-- LEADS (popup lead-capture submissions)
-- =============================================
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Anyone can submit a lead" on public.leads
  for insert with check (true);

create policy "Admins can view leads" on public.leads
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete leads" on public.leads
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- =============================================
-- PAGES (generic content pages linkable from menu/footer)
-- =============================================
create table public.pages (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pages enable row level security;

create policy "Pages are publicly readable" on public.pages
  for select using (true);

create policy "Only admins can manage pages" on public.pages
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create trigger pages_updated_at
  before update on public.pages
  for each row execute procedure public.update_updated_at();

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
  hero_badge text default 'Bộ Sưu Tập Mới 2026',
  hero_title text not null default 'Luxury Redefined',
  hero_title_image_url text,
  hero_subtitle text not null default 'Discover timeless elegance in every piece',
  hero_image_url text,
  hero2_title text,
  hero2_subtitle text,
  hero2_image_url text,
  hero2_cta text,
  contact_email text,
  contact_phone text,
  address text,
  social_instagram text,
  social_facebook text,
  menu_items jsonb default '[
    {"label": "Bộ Sưu Tập", "label_en": "Collection", "href": "/products"},
    {"label": "Áo", "label_en": "Tops", "href": "/products?category=ao"},
    {"label": "Quần", "label_en": "Bottoms", "href": "/products?category=quan"},
    {"label": "Đầm & Váy", "label_en": "Dresses & Skirts", "href": "/products?category=dam-vay"},
    {"label": "Phụ Kiện", "label_en": "Accessories", "href": "/products?category=phu-kien"}
  ]'::jsonb,
  about_title text default 'Về Chúng Tôi',
  about_content text,
  about_image_url text,
  popup_enabled boolean not null default false,
  popup_title text default 'Ưu Đãi Dành Riêng Cho Bạn',
  popup_description text default 'Để lại thông tin để nhận ưu đãi mới nhất từ chúng tôi.',
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  bank_qr_url text,
  paypal_account text,
  footer_description text default 'Thời trang luxury cao cấp — nơi phong cách gặp gỡ sự tinh tế. Mỗi món đồ là một tuyên ngôn về đẳng cấp.',
  footer_explore_links jsonb default '[
    {"label": "Bộ Sưu Tập", "label_en": "Collection", "href": "/products"},
    {"label": "Áo", "label_en": "Tops", "href": "/products?category=ao"},
    {"label": "Quần", "label_en": "Bottoms", "href": "/products?category=quan"},
    {"label": "Đầm & Váy", "label_en": "Dresses & Skirts", "href": "/products?category=dam-vay"},
    {"label": "Phụ Kiện", "label_en": "Accessories", "href": "/products?category=phu-kien"}
  ]'::jsonb,
  footer_support_links jsonb default '[
    {"label": "Tài Khoản", "label_en": "Account", "href": "/account"},
    {"label": "Liên Hệ", "label_en": "Contact Us", "href": "mailto:info@kha.vn"},
    {"label": "Chính Sách Đổi Trả", "label_en": "Return Policy", "href": "/pages/chinh-sach-doi-tra"},
    {"label": "Hướng Dẫn Size", "label_en": "Size Guide", "href": "/pages/huong-dan-size"},
    {"label": "Vận Chuyển", "label_en": "Shipping", "href": "/pages/van-chuyen"}
  ]'::jsonb,
  footer_copyright text default '© 2026 KHA. All rights reserved.',
  footer_payment_text text default 'Thanh toán an toàn với Chuyển Khoản, PayPal & COD',
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
-- STORAGE BUCKETS
-- =============================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('settings', 'settings', true)
on conflict (id) do nothing;

create policy "Product images are publicly readable"
on storage.objects for select
using (bucket_id = 'products');

create policy "Admins can upload product images"
on storage.objects for insert
with check (
  bucket_id = 'products'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can update product images"
on storage.objects for update
using (
  bucket_id = 'products'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can delete product images"
on storage.objects for delete
using (
  bucket_id = 'products'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Settings images are publicly readable"
on storage.objects for select
using (bucket_id = 'settings');

create policy "Admins can upload settings images"
on storage.objects for insert
with check (
  bucket_id = 'settings'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can update settings images"
on storage.objects for update
using (
  bucket_id = 'settings'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can delete settings images"
on storage.objects for delete
using (
  bucket_id = 'settings'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- =============================================
-- SEED DATA
-- =============================================
insert into public.categories (name, slug, description) values
  ('Áo', 'ao', 'Áo luxury cao cấp'),
  ('Quần', 'quan', 'Quần cao cấp'),
  ('Đầm & Váy', 'dam-vay', 'Đầm và váy luxury'),
  ('Phụ Kiện', 'phu-kien', 'Phụ kiện thời trang'),
  ('Set', 'set', 'Set đồ luxury')
on conflict (slug) do nothing;

-- Default content pages linked from the footer's "Hỗ Trợ" column
insert into public.pages (title, slug, content) values
(
  'Chính Sách Đổi Trả',
  'chinh-sach-doi-tra',
  'KHA hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng để đảm bảo bạn hoàn toàn hài lòng với sản phẩm.

1. Điều kiện đổi trả
- Sản phẩm còn nguyên tem, mác, chưa qua sử dụng hoặc giặt ủi.
- Còn đầy đủ hộp, túi, phụ kiện đi kèm (nếu có).
- Có hóa đơn hoặc mã đơn hàng.

2. Trường hợp không áp dụng
- Sản phẩm đã qua sử dụng, có dấu hiệu hư hỏng do người dùng.
- Đồ lót, phụ kiện cá nhân vì lý do vệ sinh.
- Sản phẩm đặt may riêng theo yêu cầu.
- Sản phẩm thuộc chương trình giảm giá trên 50%.

3. Quy trình đổi trả
- Bước 1: Liên hệ hotline hoặc email trong vòng 7 ngày kể từ khi nhận hàng.
- Bước 2: Gửi sản phẩm về địa chỉ cửa hàng theo hướng dẫn từ nhân viên hỗ trợ.
- Bước 3: Sau khi nhận và kiểm tra sản phẩm, KHA sẽ đổi size/sản phẩm khác hoặc hoàn tiền trong 3-5 ngày làm việc.

Mọi thắc mắc vui lòng liên hệ qua mục Liên Hệ ở footer.'
),
(
  'Hướng Dẫn Size',
  'huong-dan-size',
  'Hướng dẫn chọn size cho Áo, Đầm, Váy Nữ, Quần. Nếu số đo của bạn nằm giữa 2 size, hãy chọn size lớn hơn để thoải mái hơn khi mặc.

Bảng Size (đơn vị: cm)
- Size S: Vòng 1 78-83 — Vòng 2 56-60 — Vòng 3 85-89
- Size M: Vòng 1 84-89 — Vòng 2 60-66 — Vòng 3 89-94
- Size L: Vòng 1 90-95 — Vòng 2 67-72 — Vòng 3 95-100

Cách đo số đo cơ thể
- Vòng 1 (ngực): đo quanh phần ngực nở nhất.
- Vòng 2 (eo): đo quanh phần eo nhỏ nhất.
- Vòng 3 (mông): đo quanh phần mông nở nhất.

Nếu vẫn phân vân giữa 2 size, hãy liên hệ với KHA qua mục Liên Hệ để được tư vấn size phù hợp với dáng người của bạn.'
),
(
  'Vận Chuyển',
  'van-chuyen',
  'KHA giao hàng toàn quốc thông qua các đối tác vận chuyển uy tín.

1. Thời gian giao hàng
- Nội thành TP.HCM và Hà Nội: 1-2 ngày làm việc.
- Các tỉnh thành khác: 3-5 ngày làm việc.

2. Phí vận chuyển
- Miễn phí vận chuyển cho đơn hàng từ 2.000.000₫.
- Đơn hàng dưới 2.000.000₫: phí vận chuyển 50.000₫ (tính vào bước thanh toán).

3. Theo dõi đơn hàng
- Sau khi đơn hàng được xác nhận, bạn có thể theo dõi trạng thái đơn tại mục "Tài Khoản" > "Đơn Hàng".
- Mã vận đơn sẽ được gửi qua email/SMS khi đơn hàng được bàn giao cho đơn vị vận chuyển.

Mọi thắc mắc về đơn hàng vui lòng liên hệ qua mục Liên Hệ ở footer.'
)
on conflict (slug) do nothing;
