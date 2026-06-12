import Link from "next/link";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string; session_id?: string }>;
}) {
  const { order, total, session_id } = await searchParams;
  const totalCents = total ? Number(total) : null;

  return (
    <div className="wrap">
      <div className="section" style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="panel" style={{ display: "grid", gap: 18, justifyItems: "start" }}>
          <div className="success-mark" aria-hidden>
            ✓
          </div>
          <span className="kicker">Telemetry nominal</span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }} data-testid="order-confirmed">
            Order confirmed
          </h1>
          {order && (
            <p className="lede">
              Manifest <strong className="mono">{order}</strong> is logged
              {totalCents !== null && !Number.isNaN(totalCents) && (
                <> for a total of <strong>{formatPrice(totalCents)}</strong></>
              )}
              . A consultant will make contact within one working day to set
              the engagement window.
            </p>
          )}
          {session_id && (
            <p className="lede">
              Payment received via Stripe (session <span className="mono">{session_id.slice(0, 18)}…</span>).
              A consultant will make contact within one working day.
            </p>
          )}
          {!order && !session_id && (
            <p className="lede">Your order is confirmed. Watch your inbox for the engagement briefing.</p>
          )}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/catalog" className="btn btn-primary">
              Back to catalog
            </Link>
            <Link href="/" className="btn btn-ghost">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
