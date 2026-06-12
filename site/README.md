# OpenTalon — Small-Task Edge Consultants

Marketing site, blog, and catalog for OpenTalon, built with Next.js (App
Router). Aerospace clean-room design system with cyberpunk undertones.

## Pages

- `/` — landing page: hero, brand doctrine, featured projects/catalog/posts
- `/projects`, `/projects/[slug]` — three agentic mission logs (name,
  description, full story, metadata)
- `/catalog`, `/catalog/[slug]` — product catalog with category filtering,
  cart, and checkout flow
- `/blog`, `/blog/[slug]` — news / articles / guides with kind filtering
- `/about`, `/cart`, `/checkout`, `/checkout/success`

## Data layer

`lib/db.ts` reads from Neon Postgres when `DATABASE_URL` is set, and from the
bundled seed dataset (`lib/seed-data.ts`) otherwise — same shapes either way.
To initialize Neon, set `DATABASE_URL` (e.g. connect a Neon database to the
Vercel project) and visit `/api/setup` once; it creates the schema and
upserts the seed content.

## Checkout

`/api/checkout` re-prices the cart server-side, then:

- with `STRIPE_SECRET_KEY` set: creates a Stripe Checkout Session and
  redirects to Stripe;
- without it (current deployment): completes in demo mode and records the
  order to Neon when connected.

## Images

`public/images/` currently contains labeled placeholder schematics from
`tools/make_placeholders.py`. Final art: run the commands in
[IMAGE_PROMPTS.md](IMAGE_PROMPTS.md) sequentially; outputs overwrite the
placeholders in place.

## Develop

```sh
npm install
npm run dev
```
