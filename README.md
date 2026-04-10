# Quote Repository

A simple quote repository website built with React, Vite, Supabase, Vercel, and Tailwind CSS.

## Stack

- React for the UI
- Vite for fast local development
- Supabase for quote storage
- Tailwind CSS for styling
- Vercel for deployment

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env file and add your Supabase credentials:

```bash
cp .env.example .env
```

3. Start the dev server:

```bash
npm run dev
```

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL Editor. It creates the quotes table, comment threads, quote image bucket policies, the site visit counter, and the per-note view counter functions.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import it into Vercel.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project settings.
4. Deploy.

If Supabase credentials are missing, the app falls back to a local starter dataset so the UI still works.
