alter table public.store_settings
  add column if not exists about_title text default 'Về Chúng Tôi',
  add column if not exists about_content text,
  add column if not exists about_image_url text;
