import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/db";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post ? post.title : "Dispatch" };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="wrap">
      <article className="article">
        <div className="article-meta">
          <span className="chip chip-fill">{post.kind}</span>
          <span className="post-date">{post.date}</span>
          <span className="post-date">{post.author}</span>
          <span className="post-date">{post.readMinutes} min read</span>
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3.1rem)" }}>{post.title}</h1>
        <p className="lede">{post.excerpt}</p>
        <hr style={{ border: "none", borderTop: "2px solid var(--ink)", margin: "8px 0" }} />
        {post.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          {post.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Link href="/blog" className="btn btn-ghost">
            ← All dispatches
          </Link>
        </div>
      </article>
    </div>
  );
}
