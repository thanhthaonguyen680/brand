# Project Rules — KHA Store

Conventions this codebase follows. Apply them to every change so the admin panel, storefront, and database stay consistent.

## 1. Content is database-driven, never hardcoded

Categories, navigation menu, hero/about/popup copy, theme colors, and fonts all live in Supabase (`store_settings`, `categories`, etc.) and are edited from `/admin/settings` or the relevant admin page. Never hardcode display text, categories, or menu links directly in a component — read them from the DB with a sensible fallback default, the way `Navbar.tsx` falls back to `DEFAULT_LINKS` when `menu_items` is empty.

## 2. Every schema change ships a migration file

`supabase/schema.sql` is the original seed; everything since has been added incrementally via standalone files (`supabase/migration_<feature>.sql`). When adding a column, table, or storage bucket:

- Create a new `supabase/migration_<feature>.sql` (don't silently edit `schema.sql` alone — new environments run `schema.sql` once, existing ones need the incremental file).
- Migrations are **never auto-applied**. Always tell the user explicitly to run the new file in the Supabase SQL Editor after you push code — code referencing a column/table that doesn't exist yet will fail at runtime, not at build time.
- Update `lib/types.ts` in the same change whenever a DB column/table changes shape.

## 3. RLS pattern

Every table follows the same admin check, don't invent a new one:

```sql
exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
```

- Public read: `for select using (true)` when the data is meant to be visible on the storefront.
- Admin write: `for insert/update/delete ... using/with check (<admin exists check above>)`.
- Anonymous write (e.g. lead capture forms): `for insert with check (true)`, but still gate `select`/`delete` to admins.

## 4. Storage buckets need the same 4 policies

Any new upload target (`ImageUpload.tsx`, `SettingsImageInput.tsx` with a new `bucket` prop) needs a migration that:
1. `insert into storage.buckets (id, name, public) values (...) on conflict (id) do nothing;`
2. Public `select` policy on `storage.objects` for that `bucket_id`.
3. Admin-gated `insert`/`update`/`delete` policies for that `bucket_id`.

Copy the shape from `supabase/migration_storage_products.sql` or `migration_storage_settings.sql`.

## 5. Never swallow Supabase errors silently

Any admin mutation (`save`, `upsert`, `insert`, `delete`) must check `{ error }` and surface it in the UI. A past bug: the settings page always showed "✓ Đã lưu" even when RLS silently blocked the write, which made a missing column invisible for multiple sessions. Follow the pattern in `app/(admin)/admin/settings/page.tsx`'s `save()`: capture `error`, show it near the action button, and stop before the success state.

## 6. File placement conventions

- New admin page → `app/(admin)/admin/<name>/page.tsx`, and register it in `components/admin/AdminSidebar.tsx`'s `NAV` array.
- New public/storefront page → `app/(store)/<name>/page.tsx`, server component, `export const dynamic = 'force-dynamic'`, fetch via `createClient` from `lib/supabase/server`.
- Interactive client pieces (forms, uploads, toggles) → `'use client'`, fetch via `createClient` from `lib/supabase/client`.

## 7. UI consistency

- Build admin forms from `components/ui/*` (`Card`/`CardHeader`/`CardTitle`/`CardContent`, `Input`, `Label`, `Textarea`, `Button`) — don't hand-roll raw `<input>`/`<textarea>` styling.
- Gold accent color is `#c9a96e`; nav/label text uses `text-xs tracking-widest uppercase`.
- Freeform admin-authored content (hero text, about content, popup copy) is single-locale (VI) by convention — only structured nav-style items (`MenuItem.label` / `label_en`) carry an explicit English twin.

## 8. This is a customized Next.js

Per `AGENTS.md`: this Next.js build has breaking API/convention changes from training data. Read `node_modules/next/dist/docs/` before writing framework-level code (routing, data fetching, config) you haven't touched before in this repo.
