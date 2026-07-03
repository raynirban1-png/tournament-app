# Tournament Manager

A minimal football tournament management app: public team registration with UPI QR
payment, and a password-gated admin dashboard for tracking collections, expenses,
and budget. Built to run entirely on free infrastructure — GitHub Pages for hosting,
Supabase for the database.

## Stack

- **Frontend:** React + Vite, `HashRouter` (avoids GitHub Pages routing issues)
- **Backend:** Supabase (Postgres + REST API + auth), free tier
- **Payments:** Client-side UPI deep-link QR code — no payment gateway needed
- **Hosting:** GitHub Pages, deployed automatically via GitHub Actions on every push to `main`

## One-time setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open **SQL Editor -> New query**, paste the contents of `supabase/schema.sql`, and run it.
   This creates the `teams`, `transactions`, and `expenditures` tables with row-level
   security already configured (public can only insert a team registration; everything
   else needs an authenticated admin).
3. Go to **Authentication -> Users -> Add user** and create one admin login
   (email + password). This is the only account that can access `/#/admin`.
4. Go to **Project Settings -> API** and copy the **Project URL** and **anon public key**.

### 2. Configure environment variables

**For local development:** copy `.env.example` to `.env` and fill in your values.

**For deployment:** go to your GitHub repo -> **Settings -> Secrets and variables ->
Actions -> Variables tab**, and add each of these as a repository variable:

| Name | Example |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` |
| `VITE_UPI_ID` | `yourname@upi` |
| `VITE_UPI_PAYEE_NAME` | `Tournament Committee` |
| `VITE_TOURNAMENT_NAME` | `City Football Cup 2026` |
| `VITE_REGISTRATION_FEE` | `2000` |

These are safe to store as plain variables (not secrets) since the Supabase anon key
is meant to be public — access is controlled by the RLS policies in `schema.sql`, not
by hiding the key.

### 3. Enable GitHub Pages

Go to **Settings -> Pages** and set **Source** to **GitHub Actions**. That's it —
the included workflow (`.github/workflows/deploy.yml`) builds and deploys the app
automatically on every push to `main`.

### 4. Push and deploy

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

The Actions tab will show the build running. Once it finishes, your app is live at
`https://<you>.github.io/<repo>/`.

## Local development

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev
```

- Public registration form: `http://localhost:5173/`
- Admin dashboard: `http://localhost:5173/#/admin`

## How it works

- **Registration form** (`/`) — anyone with the link can register a team. No login
  required. On submit, it shows a UPI QR code (built from `VITE_UPI_ID` and the
  registration fee) so the captain can pay immediately.
- **Admin dashboard** (`/#/admin`) — sign in with the Supabase user you created.
  Four tabs:
  - **Budget** — totals, balance, team payment status, category/mode breakdowns
  - **Teams** — all registrations, inline payment status editing, delete
  - **Collections** — log who paid, how much, who collected it, and how (cash/UPI/etc)
  - **Expenses** — log tournament spending by category
- **Data** lives in Supabase. Row-level security means the public form can only
  insert into `teams` — it can't read existing registrations or touch money data.
  Everything else requires the admin login.

## Adding more admins

Add more users under **Authentication -> Users** in Supabase. Any of them can sign
in at `/#/admin` — there's no separate roles system since this is built for a small
volunteer team running one tournament.

## Notes

- Currency formatting defaults to INR (₹) since UPI is India-specific. Adjust
  `src/lib/format.js` if you need a different currency.
- If you rename the repo, no config changes are needed — `vite.config.js` uses a
  relative base path, so the build works under any subpath automatically.
