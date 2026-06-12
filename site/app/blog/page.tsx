import Link from "next/link";
import type { Metadata } from "next";
import { getPosts } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dispatches",
  description: "OpenTalon news, doctrine articles, and field guides.",
};

const KINDS = [
  { slug: "news", label: "News" },
  { slug: "article", label: "Articles" },
  { slug: "guide", label: "Guides" },
];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const allPosts = await getPosts();
  const posts = kind ? allPosts.filter((p) => p.kind === kind) : allPosts;
  const activeKind = KINDS.find((k) => k.slug === kind);

  return (
    <div className="wrap">
      <div className="page-head">
        <span className="kicker">Dispatches</span>
        <h1>{activeKind ? activeKind.label : "Blog, news & guides"}</h1>
        <p className="lede">
          Everything we publish from the edge: company news, doctrine articles
          on how small crews excel, and step-by-step field guides you can run
          without us.
        </p>
      </div>

      <div className="section" style={{ paddingTop: 32 }}>
        <div className="filter-row" data-testid="kind-filter">
          <Link href="/blog" className={!kind ? "active" : ""}>
            All ({allPosts.length})
          </Link>
          {KINDS.map((k) => (
            <Link
              key={k.slug}
              href={`/blog?kind=${k.slug}`}
              className={kind === k.slug ? "active" : ""}
            >
              {k.label} ({allPosts.filter((p) => p.kind === k.slug).length})
            </Link>
          ))}
        </div>

        <div className="post-list" data-testid="post-list">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="post-row">
              <span className="chip chip-fill">{post.kind}</span>
              <div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <p className="mono" style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginTop: 8 }}>
                  {post.author} · {post.readMinutes} min read
                </p>
              </div>
              <span className="post-date">{post.date}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
