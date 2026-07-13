insert into public.categories (name, slug, description) values
  ('Set', 'set', 'Set đồ luxury')
on conflict (slug) do nothing;
