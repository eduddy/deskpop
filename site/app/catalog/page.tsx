import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/db";
import CatalogBrowser from "@/components/CatalogBrowser";

export const metadata: Metadata = {
  title: "Catalog",
  description: "OpenTalon audits, agent deployments, field kits, and dossiers.",
};

export default async function CatalogPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <div className="wrap">
      <Suspense fallback={<div className="page-head"><h1>Catalog</h1></div>}>
        <CatalogBrowser
          categories={categories}
          products={products.map((p) => ({
            slug: p.slug,
            name: p.name,
            category: p.category,
            priceCents: p.priceCents,
            tagline: p.tagline,
            accent: p.accent,
            image: p.image,
          }))}
        />
      </Suspense>
    </div>
  );
}
