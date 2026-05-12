# DailyProof

A private preparation tracker for two engineers. No zero days. Log something every day, watch the streak grow, hold each other accountable.

Built with:
- **Next.js 16** (App Router, Server Actions, `proxy.ts`)
- **React 19**, **TypeScript**, **Tailwind v4**
- **Supabase** (Postgres + Auth + Realtime + RLS)
- shadcn-style primitives (handwritten), `lucide-react`, `sonner`

---

## Setup (one-time)

### 1. Create a Supabase project

1. Go to https://supabase.com → **New project**.
2. Pick a region close to you. Note the database password.
3. Wait for the project to provision (~1 min).

### 2. Get your keys

In the Supabase dashboard → **Project Settings → API**:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Copy `.env.example` to `.env.local` and paste them in:

```bash
cp .env.example .env.local
```

### 3. Run the schema

Open **SQL Editor → New query** in the Supabase dashboard, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This:

- Creates `profiles`, `categories`, `entries` tables.
- Enables Row Level Security so both users can read each other but only write their own.
- Adds a trigger that **blocks signups once 2 users exist**.
- Auto-creates a profile row on signup.
- Enables Postgres realtime for the three tables.

### 4. Disable email confirmation (recommended)

**Auth → Providers → Email** → toggle off "Confirm email" so you can sign in right after creating each user.

### 5. Create the two users

Use the dashboard: **Authentication → Users → Add user → Create new user**.
- Email + password for Rajeev.
- Repeat for Shubham.
- Tip: set `User Metadata` to `{ "name": "Rajeev" }` and `{ "name": "Shubham" }` so the profile names come out right. If you skip metadata, the name defaults to the part before the `@` in the email.

The login screen does not expose a signup form — the schema's `enforce_user_cap_trigger` will reject the 3rd user at the database level anyway.

### 6. Seed default categories (optional)

After both users exist, run [`supabase/seed.sql`](./supabase/seed.sql) in the SQL Editor. It populates the eight default categories (DSA, React, English, Resume, Backend, System Design, Projects, Aptitude). You can always create/edit/delete categories from the UI later.

### 7. Run the app

```bash
npm run dev
```

Open http://localhost:3000 → you'll be redirected to `/login`.

---

## Architecture

```
app/
  (app)/                  # authenticated routes — share a layout w/ topbar + quick-add + realtime
    dashboard/            # streaks, heatmap, category cards, recent feed
    heatmap/              # all heatmaps (combined / per-user / per-category)
    feed/                 # full shared activity feed
    weekly/               # auto-generated weekly review
    category/[id]/        # per-category detail
  login/                  # public auth page (Server Action signin)
  page.tsx                # redirects to /dashboard or /login

components/               # Heatmap, CategoryCard, QuickAdd, FeedItem, Topbar, StreakCards, …
  ui/                     # primitives: Button, Input, Dialog, Card, Badge, Skeleton, Icon

lib/
  supabase/{client,server,proxy}.ts  # three Supabase clients (browser / RSC / proxy)
  actions/{auth,categories,entries}.ts  # Server Actions for mutations
  data.ts                 # loadAppData() — single source for RSC pages
  streak.ts               # streak calc (current, longest, consistency %)
  types.ts                # TS shapes for Profile / Category / Entry
  utils.ts                # cn() + date helpers

supabase/
  schema.sql              # tables, RLS, signup cap, realtime
  seed.sql                # default categories

proxy.ts                  # auth gate + Supabase session refresh on every request
```

### Realtime sync

`components/realtime-sync.tsx` mounts inside the authed layout and subscribes to `entries` + `categories` changes. On any change it debounces `router.refresh()` so both users' tabs stay in sync without manual reload.

### Streak philosophy

`lib/streak.ts` computes:
- **Current streak** — consecutive days ending today (or yesterday, if you haven't logged today yet — so missing today doesn't break the streak until midnight)
- **Longest streak** — best historical run
- **30-day consistency %** — days logged in the last 30

Dates are stored as `local_date` (`YYYY-MM-DD`) in the user's local timezone so streaks line up with real days, not UTC days.

### Security model

- Both users can `SELECT` everything (it's a shared accountability app).
- `INSERT`/`UPDATE`/`DELETE` on `entries` is owner-only.
- The signup cap trigger is enforced at the database level — even if you re-enable signups in the dashboard, the 3rd user creation will fail at the DB.

---

## Keyboard shortcuts

- `Ctrl + K` — open Quick Add
- `n` — open Quick Add (when not focused in an input)
- `Ctrl + Enter` — submit Quick Add
- `Esc` — close any modal

---

## Future ideas (not built)

The spec called these out as optional and we left them as future work:

- Markdown rendering in entries (we store the raw text already)
- Image uploads (Supabase Storage)
- AI weekly summaries
- Pomodoro timer
- LeetCode/GitHub sync
- Voice journal entries
