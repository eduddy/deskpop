import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/db";
import { asset } from "@/lib/asset";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  return { title: project ? project.name : "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <div className="wrap">
      <div className="detail-grid">
        <div className="hero-img-frame" style={{ borderColor: project.accent }}>
          <span className="frame-tag" style={{ background: project.accent }}>
            MISSION LOG — {project.name}
          </span>
          <img src={asset(project.image)} alt={`${project.name} project artwork`} />
        </div>
        <div className="detail-copy">
          <span className="kicker">Agentic project</span>
          <h1 style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)" }}>{project.name}</h1>
          <p className="lede">{project.description}</p>
          <table className="spec-table">
            <tbody>
              {project.metadata.map((m) => (
                <tr key={m.label}>
                  <td className="spec-label">{m.label}</td>
                  <td>{m.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 12 }}>
        <span className="kicker" style={{ marginBottom: 18 }}>Full story</span>
        <div className="story" style={{ marginTop: 18 }}>
          {project.story.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div style={{ marginTop: 36, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/catalog?category=agent-deployments" className="btn btn-primary">
            Deploy an agent like this
          </Link>
          <Link href="/projects" className="btn btn-ghost">
            ← All projects
          </Link>
        </div>
      </div>
    </div>
  );
}
