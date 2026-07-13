-- Create the "settings" storage bucket (public read) if it doesn't exist yet
-- Used for logo, favicon, hero images, and about page image
insert into storage.buckets (id, name, public)
values ('settings', 'settings', true)
on conflict (id) do nothing;

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
