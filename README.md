# KHA

A full-stack e-commerce storefront and admin panel for a luxury fashion brand, built with Next.js and Supabase.

🔗 **Live site:** [khaoffical.vn](https://khaoffical.vn/)

> **Note:** this project runs on a customized build of Next.js. Breaking changes from stock Next.js may apply — see `AGENTS.md` before making framework-level changes.

## Tech Stack

| Layer          | Choice                                                        |
| -------------- | -------------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)       |
| Language       | TypeScript, React 19                                            |
| Styling        | Tailwind CSS 4                                                   |
| UI primitives  | Radix UI + [lucide-react](https://lucide.dev/) icons            |
| Backend        | [Supabase](https://supabase.com/) (Postgres, Auth, Storage, RLS) |
| Forms          | react-hook-form + zod                                            |
| Client state   | Zustand (cart)                                                   |
| i18n           | Custom VI/EN dictionary (`lib/i18n`)                             |

## Features

**Storefront**
- Product catalog with categories, sizes/stock, search, and filtering
- Cart, checkout with cascading  address selectors
- Payment via Bank Transfer (with QR code), PayPal, or COD — confirmed manually by staff
- Customer accounts (Supabase Auth) with order history
- Admin-editable homepage hero, About page, footer, and arbitrary content pages
- Lead-capture popup, bilingual (VI/EN) UI

**Admin panel**
- Products, orders (with editable status/payment state), customers, leads, campaigns
- Content pages CRUD for linking anywhere in the menu/footer
- Store settings split into focused pages: Theme, General Info, Homepage, Menu, Footer, About, Popup, Payment

## Project Structure

```
app/
  (store)/          Public storefront routes (/, /products, /cart, /checkout, /account, /pages/[slug]...)
  (admin)/admin/     Admin panel routes (products, orders, customers, leads, campaigns, settings/*)
  api/               Route handlers (checkout, campaigns, revalidate)
components/
  store/             Storefront UI (Navbar, Footer, ProductCard, CartSidebar...)
  admin/             Admin UI (sidebar, editors, image upload)
  ui/                Shared design-system primitives (button, input, select, card...)
lib/
  supabase/          Browser/server Supabase client factories
  i18n/               VI/EN translation dictionary + context
  hooks/              Shared client hooks (e.g. useStoreSettings)
  types.ts            Shared TypeScript types
  vn-address.ts       Vietnam province/district/ward lookup helper
store/
  cart.ts             Zustand cart store
supabase/
  schema.sql          Complete, up-to-date schema + seed data — run once on a fresh project
  migration_*.sql     Historical incremental changes, already folded into schema.sql
```

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com/) project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_STORE_NAME=
```

### 3. Set up the database

In the Supabase SQL Editor, run `supabase/schema.sql`. It's the single, up-to-date source of truth — tables, RLS policies, storage buckets, and seed data all in one file.

> The other `supabase/migration_*.sql` files are historical, incremental changes already folded into `schema.sql`. They only matter if you're upgrading a database that was set up before a given feature existed — a fresh project never needs them.

### 4. Run the app

```bash
npm run dev
```

The dev server prints the local URL to use (default `http://localhost:3000`, or another port if that one is busy).

## Contributing Workflow

This repo is public at [github.com/thanhthaonguyen680/kha-store](https://github.com/thanhthaonguyen680/kha-store).

1. **Clone the repo:**
   ```bash
   git clone https://github.com/thanhthaonguyen680/kha-store.git
   cd kha-store
   ```
2. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit & push:**
   ```bash
   git push origin feature/your-feature-name
   ```
4. **Open a Pull Request** on GitHub for review before merging into `main`.
5. Once merged, Vercel automatically deploys `main` to [khaoffical.vn](https://khaoffical.vn/).

## Deployment

The project auto-deploys via [Vercel](https://vercel.com) on every push to `main`. Any new `supabase/migration_*.sql` file must be run manually in the Supabase SQL Editor after deploying — migrations are not applied automatically. Each new migration should also be folded into `supabase/schema.sql` so it stays a complete, accurate schema for anyone setting up a fresh project.
