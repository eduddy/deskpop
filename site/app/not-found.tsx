import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="section" style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="panel" style={{ display: "grid", gap: 16, justifyItems: "start" }}>
          <span className="kicker">Signal lost</span>
          <h1>404 — Off the chart</h1>
          <p className="lede">
            This coordinate isn&apos;t on our drift map. The page may have
            moved, or it never existed and the documentation lied — it happens.
          </p>
          <Link href="/" className="btn btn-primary">
            Return to base
          </Link>
        </div>
      </div>
    </div>
  );
}
