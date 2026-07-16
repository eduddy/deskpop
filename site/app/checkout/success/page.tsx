import { Suspense } from "react";
import type { Metadata } from "next";
import SuccessView from "@/components/SuccessView";

export const metadata: Metadata = { title: "Order confirmed" };

export default function SuccessPage() {
  return (
    <div className="wrap">
      <div className="section" style={{ maxWidth: 640, margin: "0 auto" }}>
        <Suspense fallback={<div className="panel"><h1>Order confirmed</h1></div>}>
          <SuccessView />
        </Suspense>
      </div>
    </div>
  );
}
