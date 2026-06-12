import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Who OpenTalon is and why we only take small tasks.",
};

const PRINCIPLES = [
  {
    title: "Small tasks, sharp questions",
    body: "We sell fixed scopes with end dates. A 48-hour audit can't boil the ocean — which is exactly why it works. Vague questions hit billable hours; sharp ones hit bone.",
  },
  {
    title: "Bounded autonomy",
    body: "Every agent we deploy has its authority written down before it acts: these actions, these ceilings, this human gate. If the boundary can't be written down, the agent isn't designed yet.",
  },
  {
    title: "Ledger everything",
    body: "Every decision — human or machine — lands in a replayable ledger with its reasons attached. Trust isn't a vibe; it's an audit trail.",
  },
  {
    title: "Safe mode is a feature",
    body: "Spacecraft halt and call home when confidence drops, and nobody calls that failure. Our agents and our consultants get the same dignified option.",
  },
];

export default function AboutPage() {
  return (
    <div className="wrap">
      <div className="page-head">
        <span className="kicker">The outfit</span>
        <h1>About OpenTalon</h1>
        <p className="lede">
          OpenTalon is a small-task edge consultancy. We work at the place
          where your documentation stops being true — config drift, vendor
          mysteries, systems that behave like the spec is a polite suggestion —
          and we work in units small enough to finish.
        </p>
      </div>

      <div className="section" style={{ paddingTop: 36 }}>
        <div className="story">
          <p>
            The company was founded by engineers from two worlds that rarely
            meet: aerospace integration floors, where software ships to places
            nobody can reach, and the gray-market repair benches of cities
            that never fully sleep. Both worlds teach the same lesson — when a
            system meets reality, reality wins, and the crews who thrive are
            the ones who adapt fastest and write down what they learned.
          </p>
          <p>
            We kept the parts of each culture that work. From aerospace:
            qualification discipline, failure-mode interrogation, the human
            gate as a designed component. From the night markets: speed,
            improvisational tooling, and a deep suspicion of anyone selling a
            fourteen-month engagement to fix a Tuesday problem.
          </p>
          <p>
            Today OpenTalon runs four bays and a bench of consultants who
            rotate between fieldwork and building the agents in our catalog.
            Everything we sell — audits, deployments, kits, dossiers — comes
            from an engagement where we needed it ourselves first.
          </p>
        </div>

        <div className="card-grid-2" style={{ marginTop: 44 }}>
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="panel" style={{ display: "grid", gap: 10 }}>
              <h3>{p.title}</h3>
              <p style={{ color: "var(--ink-soft)" }}>{p.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 44, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/catalog" className="btn btn-primary">
            Hire us by the unit
          </Link>
          <Link href="/projects" className="btn btn-ghost">
            Read the mission logs
          </Link>
        </div>
      </div>
    </div>
  );
}
