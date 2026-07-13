"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Post = {
  slug: string;
  kind: "news" | "article" | "guide";
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readMinutes: number;
};

const KINDS = [
  { slug: "news", label: "News" },
  { slug: "article", label: "Articles" },
  { slug: "guide", label: "Guides" },
];

export default function BlogBrowser({ posts }: { posts: Post[] }) {
  const params = useSearchParams();
  const kind = params.get("kind") ?? "";
  const activeKind = KINDS.find((k) => k.slug === kind);
  const shown = kind ? posts.filter((p) => p.kind === kind) : posts;

  return (
    <>
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
            All ({posts.length})
          </Link>
          {KINDS.map((k) => (
            <Link
              key={k.slug}
              href={`/blog?kind=${k.slug}`}
              className={kind === k.slug ? "active" : ""}
            >
              {k.label} ({posts.filter((p) => p.kind === k.slug).length})
            </Link>
          ))}
        </div>

        <div className="post-list" data-testid="post-list">
          {shown.map((post) => (
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
    </>
  );
}
