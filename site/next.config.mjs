/** @type {import('next').NextConfig} */

// NEXT_EXPORT=1 builds a fully static site (GitHub Pages). NEXT_BASE_PATH sets
// the subpath for project-page hosting (e.g. "/deskpop"). Both are empty for
// normal/server builds, which keep the API routes and Neon integration.
const isExport = process.env.NEXT_EXPORT === "1";
const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig = {
  images: { unoptimized: true },
  ...(isExport ? { output: "export", trailingSlash: true } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC: isExport ? "1" : "",
  },
};

export default nextConfig;
