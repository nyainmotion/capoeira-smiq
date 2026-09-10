# Capoeira International — SMIQ Funnel (v2)

A community research tool for the global Capoeira community. Segments visitors by their relationship to the art, then asks their single most important challenge in their own words.

Branded as **Capoeira International**, run by **Malta Capoeira**.

- **v1 (live):** https://maltascapoeira.github.io/smiq/
- **v2 (this repo):** https://smiq.capoeirainternational.workers.dev

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (tokens in `app/globals.css`) |
| Database | Neon Postgres (direct connection string) |
| ORM | Drizzle ORM (`drizzle-orm/neon-http`) |
| Fonts | Playfair Display, Crimson Pro (via `next/font/google`) |
| Deploy | Cloudflare Workers, via `@opennextjs/cloudflare` |

---

## Local development

```bash
npm install
```

Create `.env.local` with the required variables:

```
DATABASE_URL=postgres://...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
OWNER_NOTIFICATION_EMAIL=...             # gets an email on each confirmed SMIQ response
NEXT_PUBLIC_APP_URL=http://localhost:3001
KIT_API_KEY=...
KIT_TAG_ID_ROLE_...             # Kit (ConvertKit) tag IDs — role, graduation, language
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...  # Cloudflare Turnstile — same real widget for local dev and production
TURNSTILE_SECRET_KEY=...            # (localhost/127.0.0.1 are allow-listed on the widget)
```

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

---

## Deploy

Deployed to Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Config lives in `wrangler.jsonc` and `open-next.config.ts`.

```bash
npm run preview   # build + run locally in the Workers runtime
npm run deploy    # build + deploy to Cloudflare
```

Secrets (same keys as `.env.local`, excluding `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) are set on the Worker with:

```bash
npx wrangler secret bulk .env.local
```

`NEXT_PUBLIC_*` vars are inlined into the client bundle at build time rather
than read at Workers runtime — make sure `.env.local` has the real production
Turnstile site key before running `npm run deploy`, not just pushed as a
runtime secret afterward.

Live at https://smiq.capoeirainternational.workers.dev.

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/smiq` | SMIQ survey form |

---

## Project structure

```
app/
  globals.css        # Design tokens + all component CSS
  layout.tsx         # Root layout (fonts, grain/glow overlays)
  page.tsx           # Landing page
  smiq/
    page.tsx         # /smiq server component shell
    SmiqForm.tsx     # Multi-step form (client component)
    actions.ts       # Server action — validates + inserts response
db/
  schema.ts          # Drizzle schema (smiq_responses table)
lib/
  db.ts              # Neon + Drizzle client
```

---

## Design system

Background `#0e0c09` · Surface `#15120d` · Gold `#c8922a` · Text `#e8dfd0`

Headings: Playfair Display · Body: Crimson Pro · Grain + radial gold glow overlays

---

## Security

The Anthropic API key is server-side only — never exposed to the browser. This was the central reason for the v1 → v2 rewrite.

---

## Milestones

- **M1** — Next.js scaffold, design tokens, Neon/Drizzle wired, landing page ported
- **M2** — SMIQ form: 4-step flow, segment picker, teacher branching, server action, success screen
- **M3** — Dashboard (private, auth-gated), AI analysis server-side *(pending)*
