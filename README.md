# ProjectX Invoice Reconciliation

Frontend app for purchase orders, invoicing, dashboard analytics, and CSV reporting.

## Stack
- TypeScript
- Vite
- Supabase (`@supabase/supabase-js`)

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create local env file:
```bash
cp .env.example .env.local
```

3. Fill Supabase values in `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

4. In Supabase SQL editor, run:
- `supabase/schema.sql`

## Run
```bash
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Notes
- If Supabase env vars are missing, the app falls back to local demo data.
- When Supabase is configured, purchase orders and invoice claims are loaded/saved to Supabase tables.
