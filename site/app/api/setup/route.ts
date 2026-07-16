// One-shot Neon initializer: creates the schema and loads the seed dataset.
// Safe to re-run; it upserts. Returns 503 until DATABASE_URL is configured.

import { NextResponse } from "next/server";
import { categories, products, projects, posts } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "DATABASE_URL is not set. Connect a Neon database to this Vercel project, then call /api/setup again.",
      },
      { status: 503 }
    );
  }

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);

  await sql`CREATE TABLE IF NOT EXISTS categories (
    slug TEXT PRIMARY KEY, name TEXT NOT NULL, blurb TEXT NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS products (
    slug TEXT PRIMARY KEY, name TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES categories(slug),
    price_cents INTEGER NOT NULL, tagline TEXT NOT NULL,
    description TEXT NOT NULL, accent TEXT NOT NULL, image TEXT NOT NULL,
    specs JSONB NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS projects (
    slug TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
    story JSONB NOT NULL, image TEXT NOT NULL, accent TEXT NOT NULL,
    metadata JSONB NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS posts (
    slug TEXT PRIMARY KEY, kind TEXT NOT NULL, title TEXT NOT NULL,
    excerpt TEXT NOT NULL, body JSONB NOT NULL, date DATE NOT NULL,
    author TEXT NOT NULL, read_minutes INTEGER NOT NULL, tags JSONB NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, email TEXT NOT NULL, name TEXT NOT NULL,
    items JSONB NOT NULL, total_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now())`;

  for (const c of categories) {
    await sql`INSERT INTO categories (slug, name, blurb) VALUES (${c.slug}, ${c.name}, ${c.blurb})
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, blurb = EXCLUDED.blurb`;
  }
  for (const p of products) {
    await sql`INSERT INTO products (slug, name, category, price_cents, tagline, description, accent, image, specs)
      VALUES (${p.slug}, ${p.name}, ${p.category}, ${p.priceCents}, ${p.tagline},
              ${p.description}, ${p.accent}, ${p.image}, ${JSON.stringify(p.specs)}::jsonb)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category,
        price_cents = EXCLUDED.price_cents, tagline = EXCLUDED.tagline,
        description = EXCLUDED.description, accent = EXCLUDED.accent,
        image = EXCLUDED.image, specs = EXCLUDED.specs`;
  }
  for (const p of projects) {
    await sql`INSERT INTO projects (slug, name, description, story, image, accent, metadata)
      VALUES (${p.slug}, ${p.name}, ${p.description}, ${JSON.stringify(p.story)}::jsonb,
              ${p.image}, ${p.accent}, ${JSON.stringify(p.metadata)}::jsonb)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
        story = EXCLUDED.story, image = EXCLUDED.image, accent = EXCLUDED.accent,
        metadata = EXCLUDED.metadata`;
  }
  for (const p of posts) {
    await sql`INSERT INTO posts (slug, kind, title, excerpt, body, date, author, read_minutes, tags)
      VALUES (${p.slug}, ${p.kind}, ${p.title}, ${p.excerpt}, ${JSON.stringify(p.body)}::jsonb,
              ${p.date}, ${p.author}, ${p.readMinutes}, ${JSON.stringify(p.tags)}::jsonb)
      ON CONFLICT (slug) DO UPDATE SET kind = EXCLUDED.kind, title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt, body = EXCLUDED.body, date = EXCLUDED.date,
        author = EXCLUDED.author, read_minutes = EXCLUDED.read_minutes, tags = EXCLUDED.tags`;
  }

  return NextResponse.json({
    ok: true,
    seeded: {
      categories: categories.length,
      products: products.length,
      projects: projects.length,
      posts: posts.length,
    },
  });
}
