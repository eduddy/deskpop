// Prefixes runtime asset URLs (plain <img>, CSS-referenced files) with the
// deploy base path. Next automatically prefixes <Link> and next/image, but not
// raw <img src> or fetches, so those go through here. Empty in normal/server
// builds; set to e.g. "/deskpop" for GitHub Pages project hosting.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}

// True when built as a fully static export (no server / API routes available).
export const IS_STATIC = process.env.NEXT_PUBLIC_STATIC === "1";
