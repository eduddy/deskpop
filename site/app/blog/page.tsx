import { Suspense } from "react";
import type { Metadata } from "next";
import { getPosts } from "@/lib/db";
import BlogBrowser from "@/components/BlogBrowser";

export const metadata: Metadata = {
  title: "Dispatches",
  description: "OpenTalon news, doctrine articles, and field guides.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="wrap">
      <Suspense fallback={<div className="page-head"><h1>Blog, news &amp; guides</h1></div>}>
        <BlogBrowser
          posts={posts.map((p) => ({
            slug: p.slug,
            kind: p.kind,
            title: p.title,
            excerpt: p.excerpt,
            date: p.date,
            author: p.author,
            readMinutes: p.readMinutes,
          }))}
        />
      </Suspense>
    </div>
  );
}
