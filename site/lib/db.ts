// Data access layer. When DATABASE_URL (Neon) is present, all reads go to
// Postgres; otherwise the bundled seed dataset serves identical shapes.
// /api/setup creates the schema and loads the seed into Neon.

import {
  categories as seedCategories,
  products as seedProducts,
  projects as seedProjects,
  posts as seedPosts,
  type Category,
  type Product,
  type Project,
  type Post,
} from "./seed-data";

export type { Category, Product, Project, Post };

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

async function sql(): Promise<any> {
  const { neon } = await import("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL!);
}

function rowToProduct(r: any): Product {
  return {
    slug: r.slug,
    name: r.name,
    category: r.category,
    priceCents: Number(r.price_cents),
    tagline: r.tagline,
    description: r.description,
    accent: r.accent,
    image: r.image,
    specs: r.specs,
  };
}

function rowToPost(r: any): Post {
  return {
    slug: r.slug,
    kind: r.kind,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    date: typeof r.date === "string" ? r.date : r.date.toISOString().slice(0, 10),
    author: r.author,
    readMinutes: Number(r.read_minutes),
    tags: r.tags,
  };
}

function rowToProject(r: any): Project {
  return {
    slug: r.slug,
    name: r.name,
    description: r.description,
    story: r.story,
    image: r.image,
    accent: r.accent,
    metadata: r.metadata,
  };
}

export async function getCategories(): Promise<Category[]> {
  if (!hasDatabase()) return seedCategories;
  const q = await sql();
  const rows = await q`SELECT slug, name, blurb FROM categories ORDER BY name`;
  return rows as Category[];
}

export async function getProducts(opts?: {
  category?: string;
  query?: string;
}): Promise<Product[]> {
  let items: Product[];
  if (hasDatabase()) {
    const q = await sql();
    const rows = await q`SELECT * FROM products ORDER BY name`;
    items = rows.map(rowToProduct);
  } else {
    items = seedProducts;
  }
  if (opts?.category) items = items.filter((p) => p.category === opts.category);
  if (opts?.query) {
    const needle = opts.query.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.tagline.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle)
    );
  }
  return items;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  if (!hasDatabase()) return seedProducts.find((p) => p.slug === slug);
  const q = await sql();
  const rows = await q`SELECT * FROM products WHERE slug = ${slug}`;
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export async function getProjects(): Promise<Project[]> {
  if (!hasDatabase()) return seedProjects;
  const q = await sql();
  const rows = await q`SELECT * FROM projects ORDER BY name`;
  return rows.map(rowToProject);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  if (!hasDatabase()) return seedProjects.find((p) => p.slug === slug);
  const q = await sql();
  const rows = await q`SELECT * FROM projects WHERE slug = ${slug}`;
  return rows[0] ? rowToProject(rows[0]) : undefined;
}

export async function getPosts(opts?: { kind?: string }): Promise<Post[]> {
  let items: Post[];
  if (hasDatabase()) {
    const q = await sql();
    const rows = await q`SELECT * FROM posts ORDER BY date DESC`;
    items = rows.map(rowToPost);
  } else {
    items = [...seedPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  if (opts?.kind) items = items.filter((p) => p.kind === opts.kind);
  return items;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  if (!hasDatabase()) return seedPosts.find((p) => p.slug === slug);
  const q = await sql();
  const rows = await q`SELECT * FROM posts WHERE slug = ${slug}`;
  return rows[0] ? rowToPost(rows[0]) : undefined;
}

export type OrderItem = { slug: string; name: string; priceCents: number; qty: number };

export async function createOrder(order: {
  id: string;
  email: string;
  name: string;
  items: OrderItem[];
  totalCents: number;
}): Promise<void> {
  if (!hasDatabase()) return; // demo mode: orders are ephemeral
  const q = await sql();
  await q`INSERT INTO orders (id, email, name, items, total_cents)
          VALUES (${order.id}, ${order.email}, ${order.name},
                  ${JSON.stringify(order.items)}::jsonb, ${order.totalCents})`;
}

export { formatPrice } from "./format";
