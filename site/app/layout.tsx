import type { Metadata } from "next";
import { Barlow_Condensed, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import CartBadge from "@/components/CartBadge";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "OpenTalon — Small-Task Edge Consultants",
    template: "%s — OpenTalon",
  },
  description:
    "OpenTalon deploys small, fixed-scope consulting strikes and bounded autonomous agents to the edge of your operation — where the spec sheet stops being true.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <header className="nav">
          <div className="wrap nav-inner">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden />
              OpenTalon
            </Link>
            <nav className="nav-links" aria-label="Primary">
              <Link href="/projects">Projects</Link>
              <Link href="/catalog">Catalog</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/about">About</Link>
              <Link href="/cart" className="cart-link">
                Cart <CartBadge />
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="wrap footer-grid">
            <div>
              <Link href="/" className="brand" style={{ color: "#fff" }}>
                <span className="brand-mark" aria-hidden />
                OpenTalon
              </Link>
              <p style={{ marginTop: 14, fontSize: "0.92rem", maxWidth: "34ch" }}>
                Small-task edge consultants. We go where the documentation stops
                being true, fix one thing properly, and leave you the ledger.
              </p>
            </div>
            <div>
              <h4>Field</h4>
              <ul>
                <li><Link href="/projects">Projects</Link></li>
                <li><Link href="/catalog">Catalog</Link></li>
                <li><Link href="/catalog?category=field-kits">Field Kits</Link></li>
              </ul>
            </div>
            <div>
              <h4>Doctrine</h4>
              <ul>
                <li><Link href="/blog">All posts</Link></li>
                <li><Link href="/blog?kind=guide">Guides</Link></li>
                <li><Link href="/blog?kind=news">News</Link></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/cart">Cart</Link></li>
                <li><Link href="/checkout">Checkout</Link></li>
              </ul>
            </div>
          </div>
          <div className="wrap footer-bottom">
            <span>© 2026 OpenTalon Consulting Group</span>
            <span>ADAPT // EXCEL // LEDGER EVERYTHING</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
