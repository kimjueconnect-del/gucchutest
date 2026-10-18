# Gucchu Test — Organised Wholesale Marketplace

A production-ready B2B wholesale marketplace that connects bulk buyers across India with verified Delhi wholesalers. Vendors list products with transparent bulk pricing; buyers order in bulk; the platform auto-assigns a verified transport partner and delivers pan-India.

> **Trial build** — built completely free using Next.js, Prisma + SQLite (local), and a custom secure auth layer. This README explains how to run it locally and how to migrate the database to **Supabase** (free tier) when you are ready to deploy.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Seeding Demo Data](#seeding-demo-data)
8. [Running the Dev Server](#running-the-dev-server)
9. [Demo Accounts](#demo-accounts)
10. [Project Structure](#project-structure)
11. [Security](#security)
12. [Switching to Supabase](#switching-to-supabase)
13. [Building & Deploying](#building--deploying)
14. [SEO & Audit](#seo--audit)
15. [Troubleshooting](#troubleshooting)

---

## Features

### Storefront (mobile-first)
- **Home** — hero, featured deals strip, shop-by-category quick links, full product grid with search, sort, pagination
- **Product detail** — multi-image carousel with clickable thumbnails, bulk-pricing tier table, quantity selector, specs, reviews + write-a-review, related products, wishlist
- **Cart** (persists across refresh) and **Checkout** with server-side price recalculation and transport auto-assignment
- **Order confirmation** + **My Orders** with a visual status timeline (Placed → Assigned → In transit → Delivered)
- **Deals**, **Markets** (Delhi live, more coming soon), **About**
- **Wishlist** — save products for later, persisted to localStorage
- **Recently viewed** — products you've browsed appear on the home page
- **Dark / light theme toggle** in the header
- Sticky header with search, location, wishlist, cart, account menu; sticky footer with vendor/transport/sales login links

### Five role systems
| Role | Capabilities |
|------|-------------|
| **Buyer** | Browse, cart, checkout, orders, reviews, wishlist |
| **Vendor** | Product CRUD, view orders containing their items, bulk-tier editing |
| **Transport** | View auto-assigned deliveries, update status (assigned → in transit → delivered) |
| **Sales rep** | Create orders on behalf of leads, earn commission per deal |
| **Admin** | Full panel: Overview stats, Products, Vendors, Transport, Sales, Deals, Orders — complete CRUD |

### Legal
Three real, substantial legal documents — Terms & Conditions (21 sections), Privacy Policy (15 sections), IT & IP Protection (13 sections, IT Act 2000 compliance).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM + SQLite (local) — **migrate to Supabase (Postgres) for production** |
| Auth | Custom secure layer (PBKDF2 hashing, JWT cookies) |
| State | Zustand (client) + TanStack Query (server) |
| Icons | Lucide React |
| Notifications | Sonner |
| Carousel | Embla Carousel React |

---

## Prerequisites

- **Node.js** 18+ (or Bun — recommended)
- **Bun** (install from https://bun.sh) — this project uses Bun for package management and running scripts

```bash
# Install Bun (macOS / Linux)
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

---

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Copy the environment template
cp .env.example .env.local

# 3. Create the database and push the schema
bun run db:push

# 4. Seed demo data (admin, vendors, transport, sales, 16 products, deals, markets)
bun run prisma/seed.ts

# 5. Start the dev server
bun run dev
```

Open **http://localhost:3000** in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root. See `.env.example` for the full template.

### Option A — Local SQLite (default, works out of the box)

```env
# SQLite database (local file)
DATABASE_URL="file:./db/custom.db"

# JWT secret for session tokens — CHANGE THIS to a random 32+ char string
JWT_SECRET="gucchutest-dev-secret-change-in-prod-9f3a7c1e"
```

### Option B — Supabase (for production deployment)

See [Switching to Supabase](#switching-to-supabase) below. You will need:

```env
# Supabase Postgres connection string (from Supabase dashboard → Settings → Database → URI)
DATABASE_URL="postgresql://postgres.<ref>:<password>@<host>:5432/postgres?pgbouncer=true&connection_limit=1"

# Supabase project URL and keys (from Supabase dashboard → Settings → API)
SUPABASE_URL="https://<your-project-ref>.supabase.co"
SUPABASE_ANON_KEY="<your-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"

# JWT secret (use a strong random string)
JWT_SECRET="<generate-a-32+-char-random-string>"
```

> **Note:** The app currently uses a custom auth layer (not Supabase Auth). The `SUPABASE_*` keys are provided for future migration to Supabase Auth and Storage. The database connection (`DATABASE_URL`) is used by Prisma regardless of which database you choose.

---

## Database Setup

This project uses **Prisma ORM**. The schema is in `prisma/schema.prisma`.

### Push the schema (creates/updates tables)

```bash
bun run db:push
```

This command:
- Reads `prisma/schema.prisma`
- Creates the SQLite database file at `db/custom.db` (if it doesn't exist)
- Creates all tables to match the schema
- Regenerates the Prisma Client

### Regenerate the Prisma Client (after schema changes)

```bash
bun run db:generate
```

### Reset the database (WARNING: deletes all data)

```bash
# Delete the database file, then re-push and re-seed
rm db/custom.db
bun run db:push
bun run prisma/seed.ts
```

---

## Seeding Demo Data

The seed script creates:

- **1 Admin** account
- **5 Vendors** (3 exclusive/verified, 2 regular)
- **3 Transport** companies (2 exclusive, 1 regular)
- **1 Sales** representative
- **1 Demo buyer**
- **5 Categories** (Furniture, Lighting & Electrical, Home Decor, Kitchen & Cookware, Building & Hardware)
- **4 Markets** (Delhi active, Mumbai/Bengaluru/Kolkata coming soon)
- **16 Products** with real images, bulk pricing tiers, specs
- **5 Deals** (featured discounts)
- **3 Sample reviews**

```bash
bun run prisma/seed.ts
```

---

## Running the Dev Server

```bash
bun run dev
```

The server starts on **http://localhost:3000**.

### Lint check

```bash
bun run lint
```

---

## Demo Accounts

The login page has one-tap demo account buttons. Credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gucchutest.com | Admin@123456 |
| Buyer | buyer@demo.com | Buyer@123456 |
| Vendor | rajesh@delhifurniture.in | Vendor@123456 |
| Transport | cargo@fastmove.in | Transport@123456 |
| Sales | arjun@sales.gucchutest.com | Sales@123456 |

---

## Project Structure

```
gucchu-test/
├── prisma/
│   ├── schema.prisma          # Database schema (Account, Vendor, Product, Order, etc.)
│   └── seed.ts                # Demo data seeder
├── public/
│   ├── logo.svg               # Brand logo
│   ├── robots.txt             # SEO robots
│   ├── sitemap.xml            # SEO sitemap
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + SEO metadata + JSON-LD
│   │   ├── page.tsx           # Single SPA route entry
│   │   ├── globals.css        # Tailwind + theme tokens (light/dark)
│   │   └── api/               # Backend API routes
│   │       ├── auth/          # login, signup, logout, me
│   │       ├── products/      # public catalog + reviews
│   │       ├── deals/         # public deals feed
│   │       ├── categories/    # public categories
│   │       ├── markets/       # public markets
│   │       ├── orders/        # buyer orders + status updates
│   │       ├── vendor/        # vendor dashboard APIs
│   │       ├── transport/     # transport dashboard APIs
│   │       ├── sales/         # sales rep APIs
│   │       └── admin/         # admin panel APIs (full CRUD)
│   ├── components/
│   │   ├── layout/            # AppHeader, AppFooter, AppShell
│   │   ├── shared/            # Logo, ProductCard, StarRating, ThemeToggle
│   │   ├── views/             # Home, Product, Cart, Checkout, Deals, Markets, About, Orders, Wishlist, Auth, VendorDashboard, TransportDashboard, SalesDashboard, AdminPanel, Legal
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── auth.ts            # Password hashing, JWT, rate limiting, validation
│       ├── db.ts              # Prisma client singleton
│       ├── guards.ts          # Auth guards + safe JSON parser
│       ├── api.ts             # Typed API client
│       ├── store.ts           # Zustand stores (nav, auth, cart, wishlist, recent, UI)
│       ├── types.ts           # Shared TypeScript types
│       ├── format.ts          # Currency/date formatters
│       └── publicProduct.ts   # Product serializer (strips vendor info)
├── .env.example               # Environment variable template
├── .env.local                 # Your local config (NOT committed)
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## Security

The platform implements multiple layers of security:

| Threat | Mitigation |
|--------|-----------|
| Password leaks | PBKDF2-SHA256 hashing (100k iterations, per-user salt) |
| Session theft | JWT in HttpOnly, SameSite=Lax cookies; 7-day expiry |
| Brute-force login | Per-IP rate limiting (8 attempts/min on login, 6/min on signup) |
| DDoS / flooding | Rate limiting on all write endpoints (orders, reviews, etc.) |
| SQL injection | Prisma parameterized queries (no raw SQL) |
| XSS | Input sanitization (strips HTML tags, `javascript:`, event handlers) |
| Bot signup | Honeypot hidden field (`website`) |
| User enumeration | Constant-time-ish password verification + generic error messages |
| Weak passwords | Enforced policy (8+ chars, upper/lower/digit/symbol, common-password block) |
| CSRF | SameSite cookies + same-origin API |
| Clickjacking | `X-Frame-Options: DENY` header |
| MIME sniffing | `X-Content-Type-Options: nosniff` header |
| Cache leaks | `Cache-Control: no-store` on API responses |

All input is validated server-side with strict allow-lists (email, name, phone, text length limits).

---

## Switching to Supabase

The app uses Prisma ORM, so switching from SQLite to Supabase (Postgres) requires only a few changes:

### Step 1 — Create a Supabase project

1. Go to https://supabase.com and create a free project
2. Wait for it to provision
3. Go to **Settings → Database** and copy the **Connection string** (URI)
4. Go to **Settings → API** and copy the **Project URL**, **anon key**, and **service_role key**

### Step 2 — Update your `.env.local`

```env
DATABASE_URL="postgresql://postgres.<ref>:<password>@<host>:5432/postgres?pgbouncer=true&connection_limit=1"

SUPABASE_URL="https://<your-project-ref>.supabase.co"
SUPABASE_ANON_KEY="<your-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"

JWT_SECRET="<generate-a-strong-random-string>"
```

> The `?pgbouncer=true&connection_limit=1` query params are required for Supabase's connection pooler (PgBouncer). Prisma needs this in serverless environments.

### Step 3 — Update the Prisma datasource

Open `prisma/schema.prisma` and change the datasource provider from `sqlite` to `postgresql`:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

> **Note:** SQLite and Postgres have some type differences. The schema uses `String` for JSON fields (stored as text), which works in both. `Float` works in both. No schema changes are needed beyond the provider.

### Step 4 — Push the schema to Supabase

```bash
bun run db:push
```

This creates all tables in your Supabase Postgres database.

### Step 5 — Seed the Supabase database

```bash
bun run prisma/seed.ts
```

### Step 6 — (Optional) Enable Supabase Auth

The app currently uses its own JWT-based auth. To migrate to Supabase Auth:
1. Install `@supabase/supabase-js`
2. Create a Supabase client in `src/lib/supabase.ts`
3. Replace the auth functions in `src/app/api/auth/*/route.ts` with Supabase Auth calls
4. Replace the JWT cookie logic in `src/lib/auth.ts`

This is optional — the custom auth layer is secure and works fine with Supabase as just the database.

### Step 7 — (Optional) Use Supabase Storage for product images

Currently images are hosted externally. To use Supabase Storage:
1. Create a bucket in Supabase dashboard
2. Upload images and use the public URLs
3. Update the `images` JSON array in the product seed/schema

---

## Building & Deploying

### Build for production

```bash
bun run build
```

This creates a production build in `.next/`.

### Deploy to Vercel (recommended for Next.js)

1. Push your code to GitHub
2. Go to https://vercel.com and import the repository
3. Add environment variables in Vercel project settings:
   - `DATABASE_URL` — your Supabase Postgres connection string
   - `JWT_SECRET` — a strong random string
4. Deploy

### Deploy to Netlify

1. Push to GitHub
2. Import on https://netlify.com
3. Build command: `bun run build`
4. Add the same environment variables
5. Deploy

### Deploy with Docker

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

---

## SEO & Audit

The app includes comprehensive SEO:

- **Metadata** — title, description, keywords, Open Graph, Twitter Card, canonical URL
- **JSON-LD structured data** — Organization and WebSite schemas (in `layout.tsx`)
- **robots.txt** — allows all crawlers, blocks `/api/`
- **sitemap.xml** — lists the root URL
- **PWA manifest** — installable web app
- **Semantic HTML** — `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>`, `<h1>`–`<h3>`
- **Accessibility** — ARIA labels, keyboard navigation, alt text, 44px+ touch targets
- **Performance** — lazy-loaded images, code-splitting, font `display: swap`
- **Theme color** — meta tag for browser UI

> **Note:** This is a client-rendered SPA (single route). For maximum SEO, consider adding server-side rendering or static generation for product pages in a future iteration.

---

## Troubleshooting

### "Cannot find module '@prisma/client'"
Run `bun run db:generate` to regenerate the Prisma Client.

### "Database connection error"
- For SQLite: ensure `db/` directory exists and `DATABASE_URL` points to `file:./db/custom.db`
- For Supabase: verify the connection string and that `?pgbouncer=true` is included

### "Port 3000 already in use"
Change the port in `package.json` (`next dev -p 3001`) or kill the process using the port.

### Theme toggle doesn't persist
next-themes persists to `localStorage` under the key `theme`. Clear localStorage if it gets stuck.

### Cart/wishlist/recently-viewed not persisting
These use `localStorage` under keys `bc-cart`, `bc-wishlist`, `bc-recent`. Clear site data to reset.

### Seeding fails
Delete the database and retry:
```bash
rm db/custom.db
bun run db:push
bun run prisma/seed.ts
```

---

## License

This is a trial project for **Gucchu Test**. All rights reserved.

## Contact

- **Grievance Officer:** grievance@gucchutest.com
- **Company:** Gucchu Test Technologies Pvt. Ltd., Delhi, India
