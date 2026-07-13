-- Create the "products" storage bucket (public read) if it doesn't exist yet
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Anyone can view/download images (bucket is public)
create policy "Product images are publicly readable"
on storage.objects for select
using (bucket_id = 'products');

-- Only admins can upload
create policy "Admins can upload product images"
on storage.objects for insert
with check (
  bucket_id = 'products'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Only admins can update
create policy "Admins can update product images"
on storage.objects for update
using (
  bucket_id = 'products'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Only admins can delete
create policy "Admins can delete product images"
on storage.objects for delete
using (
  bucket_id = 'products'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
