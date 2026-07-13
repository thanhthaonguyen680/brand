-- Popup settings on store_settings
alter table public.store_settings
  add column if not exists popup_enabled boolean not null default false,
  add column if not exists popup_title text default 'Ưu Đãi Dành Riêng Cho Bạn',
  add column if not exists popup_description text default 'Để lại thông tin để nhận ưu đãi mới nhất từ chúng tôi.';

-- Leads collected from the popup
create table if not exists public.leads (
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
