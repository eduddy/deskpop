import Link from "next/link";
import type { Metadata } from "next";
import { getProjects } from "@/lib/db";

export const metadata: Metadata = {
  title: "Projects",
  description: "Mission logs from OpenTalon's agentic engagements.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="wrap">
      <div className="page-head">
        <span className="kicker">Mission logs</span>
        <h1>Projects</h1>
        <p className="lede">
          Three engagements, three autonomous agents, three edges held. Each
          log is published with the client&apos;s blessing and the agent&apos;s
          full metadata — because bounded autonomy you can&apos;t inspect is
          just marketing.
        </p>
      </div>
      <div className="section" style={{ paddingTop: 36 }}>
        <div className="post-list">
          {projects.map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="post-row" style={{ gridTemplateColumns: "150px 1fr auto", borderLeft: `6px solid ${p.accent}` }}>
              <img src={p.image} alt={`${p.name} artwork`} style={{ width: 150, border: "1.5px solid var(--ink)" }} />
              <div>
                <span className="chip chip-fill">Agentic project</span>
                <h3 style={{ marginTop: 8 }}>{p.name}</h3>
                <p>{p.description}</p>
              </div>
              <span className="post-date">{p.metadata[1]?.value}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
