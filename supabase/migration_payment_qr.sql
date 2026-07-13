alter table public.store_settings
  add column if not exists bank_qr_url text;
