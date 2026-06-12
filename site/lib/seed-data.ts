// Canonical seed dataset for OpenTalon. Used directly when DATABASE_URL is
// absent, and pushed into Neon by /api/setup when it is present.

export type Category = {
  slug: string;
  name: string;
  blurb: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string; // category slug
  priceCents: number;
  tagline: string;
  description: string;
  accent: string; // hex accent used on card + placeholder art
  image: string;
  specs: { label: string; value: string }[];
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  story: string[];
  image: string;
  accent: string;
  metadata: { label: string; value: string }[];
};

export type Post = {
  slug: string;
  kind: "news" | "article" | "guide";
  title: string;
  excerpt: string;
  body: string[];
  date: string;
  author: string;
  readMinutes: number;
  tags: string[];
};

export const categories: Category[] = [
  {
    slug: "edge-audits",
    name: "Edge Audits",
    blurb:
      "Short, fixed-scope inspections of the places where your spec sheet stops being true.",
  },
  {
    slug: "agent-deployments",
    name: "Agent Deployments",
    blurb:
      "Production-grade autonomous agents, scoped to one job, shipped with a human escape hatch.",
  },
  {
    slug: "field-kits",
    name: "Field Kits",
    blurb:
      "Hardware and tooling crates our consultants carry into hangars, server rooms, and night markets.",
  },
  {
    slug: "dossiers",
    name: "Guides & Dossiers",
    blurb:
      "Written doctrine. Everything we learned at the edge, typeset so your team can learn it cheaper.",
  },
];

export const products: Product[] = [
  {
    slug: "talon-recon-audit",
    name: "Talon Recon Audit",
    category: "edge-audits",
    priceCents: 180000,
    tagline: "48 hours. One subsystem. A straight answer.",
    description:
      "Our smallest engagement and our most ordered one. A single OpenTalon consultant embeds with your team for 48 hours, traces one misbehaving subsystem to the point where the documentation diverges from reality, and hands you a one-page flight card: what is actually happening, what it costs you, and the three smallest interventions that fix it. No retainer, no follow-on pitch baked into the findings.",
    accent: "#f95d0a",
    image: "/images/products/talon-recon-audit.png",
    specs: [
      { label: "Duration", value: "48 hours" },
      { label: "Crew", value: "1 consultant" },
      { label: "Deliverable", value: "Flight card + debrief" },
      { label: "SKU", value: "OT-EA-001" },
    ],
  },
  {
    slug: "drift-map-audit",
    name: "Drift Map Audit",
    category: "edge-audits",
    priceCents: 320000,
    tagline: "Chart where your system left the spec — and how fast.",
    description:
      "Every long-lived system drifts away from its design documents. The Drift Map Audit measures that gap across an entire service or production line: a week of instrumented observation, then a contour map of where reality and paperwork have parted ways, ranked by blast radius. Teams use it before audits, acquisitions, and any migration big enough to be scary.",
    accent: "#0a84c1",
    image: "/images/products/drift-map-audit.png",
    specs: [
      { label: "Duration", value: "5 working days" },
      { label: "Crew", value: "2 consultants" },
      { label: "Deliverable", value: "Drift contour map" },
      { label: "SKU", value: "OT-EA-002" },
    ],
  },
  {
    slug: "hard-burn-review",
    name: "Hard Burn Review",
    category: "edge-audits",
    priceCents: 550000,
    tagline: "Pre-launch review for systems that only get one ignition.",
    description:
      "For the deployments you cannot roll back: launch software, cutovers, regulatory go-lives. A two-consultant team runs your plan through failure-mode interrogation borrowed from range-safety practice, then signs a written go / no-go opinion with the specific conditions under which we would scrub. We have scrubbed clients before. They thanked us in writing afterward.",
    accent: "#b8231f",
    image: "/images/products/hard-burn-review.png",
    specs: [
      { label: "Duration", value: "10 working days" },
      { label: "Crew", value: "2 consultants" },
      { label: "Deliverable", value: "Go / no-go opinion" },
      { label: "SKU", value: "OT-EA-003" },
    ],
  },
  {
    slug: "wayfinder-deployment",
    name: "Wayfinder Deployment",
    category: "agent-deployments",
    priceCents: 740000,
    tagline: "An autonomous logistics negotiator, scoped to one supply chain.",
    description:
      "A production deployment of the agent architecture proven on WAYFINDER-7. Wayfinder watches one supply chain end to end, re-plans routing and vendor allocation when conditions slip, and negotiates inside hard guardrails you set: budget ceilings, approved vendor lists, and a human sign-off gate on anything novel. Ships with a full action ledger so you can replay every decision it made.",
    accent: "#e8a013",
    image: "/images/products/wayfinder-deployment.png",
    specs: [
      { label: "Lead time", value: "3 weeks" },
      { label: "Autonomy", value: "Bounded, ledgered" },
      { label: "Escape hatch", value: "Human gate, always" },
      { label: "SKU", value: "OT-AD-101" },
    ],
  },
  {
    slug: "cindertrace-deployment",
    name: "Cindertrace Deployment",
    category: "agent-deployments",
    priceCents: 890000,
    tagline: "A forensics agent that reads your telemetry like a flight recorder.",
    description:
      "Cindertrace ingests the telemetry your fleet already emits and builds causal timelines for anomalies — not dashboards, narratives. When something fails at 03:00 it hands your on-call engineer the story so far: what changed, in what order, and which earlier incident it rhymes with. Derived from the CINDERTRACE engagement that found a six-month-old firmware regression in eleven hours.",
    accent: "#7a3df0",
    image: "/images/products/cindertrace-deployment.png",
    specs: [
      { label: "Lead time", value: "4 weeks" },
      { label: "Ingest", value: "Your existing telemetry" },
      { label: "Output", value: "Causal incident narratives" },
      { label: "SKU", value: "OT-AD-102" },
    ],
  },
  {
    slug: "ledgerhawk-deployment",
    name: "Ledgerhawk Deployment",
    category: "agent-deployments",
    priceCents: 620000,
    tagline: "Reconciliation across vendors who don't share a schema — or a language.",
    description:
      "Built from the NIGHT MARKET LEDGER playbook. Ledgerhawk reconciles transactions across fragmented vendor ecosystems: mismatched formats, partial records, three currencies and a barter column. It flags genuine discrepancies, auto-resolves the boring ones, and keeps an evidence trail your auditors will actually accept. Popular with marketplaces, logistics brokers, and anyone who inherited a spreadsheet empire.",
    accent: "#0fae7c",
    image: "/images/products/ledgerhawk-deployment.png",
    specs: [
      { label: "Lead time", value: "3 weeks" },
      { label: "Sources", value: "Up to 40 vendor feeds" },
      { label: "Evidence", value: "Audit-grade trail" },
      { label: "SKU", value: "OT-AD-103" },
    ],
  },
  {
    slug: "edge-crate-mk2",
    name: "Edge Crate Mk.II",
    category: "field-kits",
    priceCents: 94000,
    tagline: "The carry-on data center our consultants won't fly without.",
    description:
      "A flight-case kit for working where the network is hostile or absent: hardened mini-host, isolated capture interfaces, write-blockers, a spool of every adapter that has ever saved an engagement, and pre-imaged drives for evidence handling. The Mk.II adds a passive cooling deck rated for hangar summers and a faraday pouch sized for whatever the client hands you.",
    accent: "#5b6770",
    image: "/images/products/edge-crate-mk2.png",
    specs: [
      { label: "Mass", value: "8.4 kg loaded" },
      { label: "Case", value: "IP67 flight case" },
      { label: "Power", value: "100–240 V + DC field input" },
      { label: "SKU", value: "OT-FK-201" },
    ],
  },
  {
    slug: "null-g-bench-kit",
    name: "Null-G Bench Kit",
    category: "field-kits",
    priceCents: 126000,
    tagline: "A test bench that assumes nothing about gravity, power, or vibration.",
    description:
      "Born from a contract on a parabolic-flight payload: a modular instrumentation bench with magnetic and strap-down fixturing, vibration-isolated sensor rails, and logging that timestamps against three independent clocks. On the ground it is simply a very good portable bench. In motion — aircraft, ship, truck convoy — it is the only one of our kits that keeps its calibration.",
    accent: "#1f7ab8",
    image: "/images/products/null-g-bench-kit.png",
    specs: [
      { label: "Mass", value: "11.2 kg loaded" },
      { label: "Fixturing", value: "Magnetic + strap-down" },
      { label: "Clocks", value: "3× independent" },
      { label: "SKU", value: "OT-FK-202" },
    ],
  },
  {
    slug: "glow-protocol-dossier",
    name: "Glow Protocol Dossier",
    category: "dossiers",
    priceCents: 18000,
    tagline: "Our doctrine for shipping agents that don't embarrass you at night.",
    description:
      "Ninety pages of hard-won practice for running autonomous agents in production: guardrail design, action ledgers, human gates, kill criteria, and the social engineering required to get an ops team to trust a machine colleague. Includes the full checklists we use on Wayfinder and Cindertrace deployments, and the post-mortems where we earned them.",
    accent: "#d4317a",
    image: "/images/products/glow-protocol-dossier.png",
    specs: [
      { label: "Format", value: "PDF, 90 pages" },
      { label: "Includes", value: "Checklists + templates" },
      { label: "License", value: "Whole-team" },
      { label: "SKU", value: "OT-GD-301" },
    ],
  },
  {
    slug: "night-shift-playbook",
    name: "Night Shift Playbook",
    category: "dossiers",
    priceCents: 22000,
    tagline: "How small crews keep big systems alive between midnight and dawn.",
    description:
      "A field manual for skeleton crews: triage doctrine for the hours when nobody senior is awake, escalation thresholds that respect both the system and the sleeper, and the handoff rituals that stop 06:00 from being a crime scene. Written from interviews with seventy on-call engineers and four of our own consultants who have done the worst shifts on three continents.",
    accent: "#3b3f8f",
    image: "/images/products/night-shift-playbook.png",
    specs: [
      { label: "Format", value: "PDF, 64 pages" },
      { label: "Includes", value: "Triage cards" },
      { label: "License", value: "Whole-team" },
      { label: "SKU", value: "OT-GD-302" },
    ],
  },
];

export const projects: Project[] = [
  {
    slug: "wayfinder-7",
    name: "WAYFINDER-7",
    description:
      "An autonomous logistics agent that re-planned a launch provider's ground supply chain in real time — and negotiated its way through a port strike without waking anyone up.",
    story: [
      "The client built small orbital launch vehicles on a coastal pad with a supply chain that looked, on paper, like a straight line: three fabricators, two freight corridors, one integration hangar. In practice it was a nervous system. A late cryo-valve shipment didn't cost a day; it cost a launch window, and launch windows were worth more than the rocket.",
      "OpenTalon's brief was deliberately small: don't fix the supply chain, just make it see. We deployed WAYFINDER-7, a single agent with read access to every carrier feed, fabricator queue, and weather product the client subscribed to, and write access to exactly one thing — a re-planning proposal queue with a human gate.",
      "Three weeks in, the gate became the bottleneck. The proposals were good. The client widened the agent's authority in concentric rings: first automatic re-routing under a cost ceiling, then vendor re-allocation within an approved list, each ring backed by the action ledger that recorded why every decision was made.",
      "The test came in month four, when a port strike severed the primary freight corridor nine days before a window. WAYFINDER-7 had been watching union news sentiment for weeks and had already warm-started contingency quotes. It re-routed 60% of inbound mass through a secondary corridor, split one critical shipment across air freight inside its cost ceiling, and queued exactly one decision for a human: accept a 36-hour slip, or pay a premium it wasn't authorized to approve. The integration lead answered from her phone. The window held.",
      "The client's post-engagement note is framed in our office: 'It never once pretended to know something it didn't. That's more than I can say for most consultants.' Fair.",
    ],
    image: "/images/projects/wayfinder-7.png",
    accent: "#e8a013",
    metadata: [
      { label: "Sector", value: "Orbital launch / logistics" },
      { label: "Engagement", value: "16 weeks, 2 consultants" },
      { label: "Agent class", value: "Bounded-autonomy planner" },
      { label: "Authority model", value: "Concentric rings + human gate" },
      { label: "Headline outcome", value: "Launch window held through port strike" },
      { label: "Ledgered actions", value: "11,406" },
    ],
  },
  {
    slug: "cindertrace",
    name: "CINDERTRACE",
    description:
      "A telemetry-forensics agent that read eight months of stratospheric relay data like a flight recorder and found the firmware regression everyone had stopped looking for.",
    story: [
      "The client operated a fleet of high-altitude relay platforms — solar, autonomous, and twenty kilometers beyond the reach of a screwdriver. For eight months, units had been dropping into safe mode at a rate just low enough to ignore and just high enough to hurt. Two internal investigations had concluded 'environmental factors.' The third investigation was us.",
      "We deployed CINDERTRACE, an agent built to do one thing relentlessly: construct causal timelines from telemetry instead of dashboards. It ingested the full archive — power curves, attitude logs, thermal profiles, firmware version vectors — and began stitching each safe-mode event into a narrative: what changed, in what order, and which earlier event it rhymed with.",
      "The agent's first useful act was destroying our own hypothesis. We suspected a thermal design flaw; CINDERTRACE showed the thermal signature was a symptom, trailing the fault by ninety seconds, never leading it. It flagged instead a pattern no human had cross-referenced: every affected unit had received firmware 4.1.7 — and then been through a specific battery-cell supplier's lot.",
      "Eleven hours into the engagement, CINDERTRACE produced the timeline that ended it: 4.1.7 had changed a charge-controller polling interval, harmless on most cells, resonant with an undocumented protection quirk in one supplier's lot. The interaction was invisible in any single unit's data and obvious across two hundred. The fix was a four-line patch and a supplier conversation.",
      "Safe-mode events fell 94% over the next quarter. The client kept the agent. It now reads every night's telemetry before their engineers wake up, and files its narratives under a name the ops team gave it, which we are contractually unable to repeat.",
    ],
    image: "/images/projects/cindertrace.png",
    accent: "#7a3df0",
    metadata: [
      { label: "Sector", value: "Stratospheric platforms / HAPS" },
      { label: "Engagement", value: "6 weeks, 1 consultant" },
      { label: "Agent class", value: "Causal-forensics analyst" },
      { label: "Archive ingested", value: "8 months, 214 units" },
      { label: "Time to root cause", value: "11 hours" },
      { label: "Headline outcome", value: "Safe-mode events down 94%" },
    ],
  },
  {
    slug: "night-market-ledger",
    name: "NIGHT MARKET LEDGER",
    description:
      "A swarm of reconciliation agents that brought audit-grade books to a megacity night-market network running on four currencies, three languages, and zero shared schemas.",
    story: [
      "The client was a marketplace platform that had grown the honest way: by absorbing the chaos of a real economy. Six hundred vendors across a dense urban night-market network, settling in four currencies, invoicing in whatever software they already owned, and occasionally in photographs of paper. The platform's finance team was drowning, and an audit was coming.",
      "A monolithic cleanup was quoted to them elsewhere at fourteen months. Our counter-offer was characteristically smaller: one agent per data shape, not one system to rule them all. NIGHT MARKET LEDGER was a swarm — small parsers that each learned a single vendor dialect, feeding a reconciliation core that demanded evidence, not formats.",
      "The hard part was not the parsing; it was the epistemology. The core was built to hold competing claims about the same transaction without prematurely resolving them — a vendor's photographed receipt, the platform's API record, a payment processor's settlement line — and to attach a confidence and an evidence chain to every match it proposed. Boring matches resolved themselves. Interesting ones queued for humans, pre-briefed.",
      "By week nine the swarm was reconciling 96% of daily volume untouched, and the queue of interesting cases had become the finance team's favorite reading: it surfaced two genuine fraud patterns and one vendor who had been accidentally underpaid for a year. The platform paid him back. The story made the rounds, and three vendors who had refused integration asked to join.",
      "The audit, when it came, took nine days instead of the feared ninety. The auditors' only complaint was that the evidence trails were 'almost suspiciously good.' We have decided to take that as a compliment.",
    ],
    image: "/images/projects/night-market-ledger.png",
    accent: "#0fae7c",
    metadata: [
      { label: "Sector", value: "Marketplace / urban commerce" },
      { label: "Engagement", value: "12 weeks, 3 consultants" },
      { label: "Agent class", value: "Reconciliation swarm" },
      { label: "Vendor dialects learned", value: "600+" },
      { label: "Untouched reconciliation", value: "96% of daily volume" },
      { label: "Headline outcome", value: "Audit closed in 9 days" },
    ],
  },
];

export const posts: Post[] = [
  {
    slug: "bay-4-is-open",
    kind: "news",
    title: "Bay 4 is open: OpenTalon adds a hardware integration floor",
    excerpt:
      "Our new integration bay means field kits ship pre-imaged, pre-burned-in, and pre-argued-over by people who will have to carry them.",
    body: [
      "As of this month, OpenTalon operates a fourth bay: a hardware integration floor where every Edge Crate and Null-G Bench Kit is assembled, imaged, burned in for 72 hours, and signed by the consultant who would be willing to take that exact unit on an engagement.",
      "The signature is the point. Our kits have always been built from gear we actually carry, but until now final assembly happened wherever a consultant had bench space. Bay 4 gives that process a fixed address, a vibration table, and a thermal chamber we bought at an aerospace surplus auction for a price we are still smug about.",
      "Practically, this changes two things for customers. Field kit lead times drop from three weeks to eight working days. And every kit now ships with its own burn-in telemetry attached — the actual logs from its 72 hours on the bench, not a certificate that says trust us.",
      "Bay 4 also gives us room to prototype the next kit in the line. We are not announcing it yet, except to say that several consultants have strong opinions about antenna masts, and the thermal chamber has already earned its keep.",
    ],
    date: "2026-05-18",
    author: "OpenTalon Ops",
    readMinutes: 3,
    tags: ["facilities", "field-kits"],
  },
  {
    slug: "wayfinder-7-case-study",
    kind: "news",
    title: "WAYFINDER-7 case study published: the port strike that didn't matter",
    excerpt:
      "The full engagement story behind our logistics agent is now public — concentric authority rings, the action ledger, and the one decision it refused to make alone.",
    body: [
      "With our client's blessing (and their legal team's edits, which were lighter than expected), the full WAYFINDER-7 case study is now live on our projects page.",
      "If you only read one section, read the authority model. The agent started with write access to nothing but a proposal queue, and earned wider authority in explicit, documented rings. Every expansion was a decision a named human made, recorded next to the evidence that justified it.",
      "The case study also includes the part we are proudest of and clients ask about most: the moment the agent hit the edge of its authority during the port strike and queued exactly one question for a human instead of guessing. Bounded autonomy is not a limitation we apologize for. It is the product.",
      "Read the full story under Projects → WAYFINDER-7, and if your supply chain has a launch window of its own, the Wayfinder Deployment is in our catalog.",
    ],
    date: "2026-04-29",
    author: "OpenTalon Comms",
    readMinutes: 2,
    tags: ["projects", "agents", "case-study"],
  },
  {
    slug: "small-tasks-beat-big-retainers",
    kind: "article",
    title: "Small tasks beat big retainers at the edge",
    excerpt:
      "The edge of a system punishes long commitments and rewards fast, scoped interrogation. An argument for consulting in 48-hour units.",
    body: [
      "There is a place in every system where the documentation stops being true. We call it the edge. It is not a location; it is a condition — the point where config drifted, where the vendor's promise and the firmware's behavior parted ways, where the person who understood the cron job left in 2023.",
      "The consulting industry's standard answer to the edge is mass: a retainer, a team, a discovery phase with its own discovery phase. Our experience is that mass is exactly wrong. The edge is not big; it is sharp. It punishes long commitments because the problem mutates faster than a statement of work, and it rewards small, fast, brutally scoped interrogation.",
      "A 48-hour audit cannot boil the ocean, which is its central virtue. It forces a question sharp enough to answer: not 'assess our infrastructure' but 'why does the line stop on Tuesdays.' Sharp questions hit bone. Vague ones hit billable hours.",
      "This is also why our agent deployments are scoped to one job each. An agent that watches one supply chain can be audited, ledgered, and trusted. An agent platform that promises to run your company is a retainer with a GPU bill.",
      "None of this means big problems don't exist. It means big problems are made of small ones, and the edge is where you can still tell them apart. Start there. Start small. The bone is closer than you think.",
    ],
    date: "2026-03-12",
    author: "M. Okonkwo, Principal",
    readMinutes: 5,
    tags: ["doctrine", "consulting"],
  },
  {
    slug: "adaptation-is-a-discipline",
    kind: "article",
    title: "Adaptation is a discipline, not a trait",
    excerpt:
      "People who excel at the edge aren't improvising. They're running a practiced loop — observe, re-plan, act small, ledger everything — that anyone can train.",
    body: [
      "Our hiring page says we look for people who adapt and excel, and candidates routinely misread it. They tell us stories about thinking on their feet, about chaos surfed and all-nighters survived. Improvisation theater. It is the opposite of what we mean.",
      "Adaptation, as practiced by the people we actually hire, is a discipline with a visible loop: observe wider than the task, re-plan earlier than is comfortable, act in the smallest unit that produces information, and write down what happened so the next loop starts smarter. Pilots train this. Flight controllers train this. There is no reason consultants and engineers cannot.",
      "The loop is also exactly what we build into our agents, which is not a coincidence. WAYFINDER-7's concentric authority rings are the 'act small' step with an audit trail. CINDERTRACE's causal narratives are the ledger. We did not teach the machines to improvise. We taught them the discipline, because the discipline is what scales.",
      "The trait theory of adaptation has one more cost worth naming: it lets organizations off the hook. If adapting is a personality, you hire for it and hope. If it is a discipline, you have to build the conditions for the loop — observation that isn't siloed, re-planning that isn't punished, small actions that are allowed to fail informatively. That is harder than hiring. It is also the entire game.",
    ],
    date: "2026-02-20",
    author: "R. Vasquez, Field Director",
    readMinutes: 5,
    tags: ["doctrine", "people"],
  },
  {
    slug: "scoping-a-48-hour-audit",
    kind: "guide",
    title: "Field guide: scoping a 48-hour edge audit",
    excerpt:
      "How to compress a real problem into a question sharp enough to answer in two days — the same intake we run before every Talon Recon Audit.",
    body: [
      "Every Talon Recon Audit starts with the same intake, and the intake is harder than the audit. This guide walks through it so you can run the compression yourself — with us or without us.",
      "Step one: name the symptom in observable terms. 'The deploy pipeline is flaky' is a mood. 'Deploys to staging fail roughly twice a week with timeout errors since March' is a symptom. If you cannot state when it started and how often it bites, spend a day measuring before you spend money investigating.",
      "Step two: bound the blast radius. List what the symptom actually costs — hours, money, launch windows, morale — and what it touches. The bound tells you whether 48 hours of attention is proportionate. Sometimes the honest answer is that the problem is annoying but cheap, and the audit you need is on something less loud and more expensive.",
      "Step three: pick the divergence point. Somewhere there is a document, config, or promise that says the system behaves one way, and a reality that disagrees. The audit's job is to find where they diverged, so the scope should name the spec you believe and the behavior that betrays it.",
      "Step four: decide in advance what you'll do with each likely answer. If the root cause is vendor firmware, will you escalate or live with it? If it is your own config drift, who owns the fix? An answer nobody is prepared to act on is trivia, not consulting.",
      "Run those four steps and you have a one-paragraph scope: symptom, cost, suspected divergence, and intended action. That paragraph is what our consultants read on the flight in. Two days is plenty — if the question is sharp.",
    ],
    date: "2026-01-15",
    author: "OpenTalon Field Office",
    readMinutes: 6,
    tags: ["audits", "how-to"],
  },
  {
    slug: "hardening-agents-for-vacuum-grade-ops",
    kind: "guide",
    title: "Hardening agents for vacuum-grade ops",
    excerpt:
      "Aerospace ships software into environments where nobody can press reset. Five practices from that world that make production agents trustworthy.",
    body: [
      "Aerospace software has a property most production software pretends to have: it must run where no one can reach it. That constraint produced a discipline, and the discipline transfers almost perfectly to autonomous agents. Five practices we port directly into every deployment:",
      "One — bounded authority, declared up front. A flight computer can command the actuators it owns and nothing else. An agent should have its authority enumerated the same way: these actions, these ceilings, this vendor list. If you cannot write the boundary down, you have not designed the agent; you have released it.",
      "Two — every action ledgered, with the reason. Flight recorders exist because post-hoc narrative is how complex failures get understood. Your agent needs one: action, timestamp, inputs, and the why. Storage is cheap. Reconstructing an unledgered decision at 03:00 is not.",
      "Three — safe mode is a feature, not a failure. Spacecraft drop to safe mode on anomaly and wait for guidance, and nobody calls that a crash. Give your agent the same dignified halt: a defined state it enters when confidence drops, which preserves evidence and pages a human. The alternative is an agent that guesses with authority.",
      "Four — test the seams, not the demo. Aerospace qualification doesn't re-run the happy path; it attacks interfaces — power dips, clock skew, partial data. Agents fail at the same seams: truncated context, stale feeds, two tools disagreeing. Build your test rig there.",
      "Five — the human gate is part of the system, not an apology for it. Mission control is not a sign the spacecraft is bad. Design the human's interruption point with the same care as the agent's planner: what they see, how fast they can act, and what the agent does while it waits. Trust is built at that gate or nowhere.",
    ],
    date: "2026-04-07",
    author: "M. Okonkwo, Principal",
    readMinutes: 7,
    tags: ["agents", "doctrine", "how-to"],
  },
  {
    slug: "reading-a-drift-map",
    kind: "guide",
    title: "Reading a drift map",
    excerpt:
      "Your Drift Map Audit came back. Here's how to read the contours, which zones to fix first, and which divergences you should formally adopt instead.",
    body: [
      "A drift map is a contour chart of disagreement: every place where your system's documented behavior and its observed behavior diverge, plotted by severity and blast radius. Clients receive one at the end of every Drift Map Audit. This is how to read it.",
      "The contours rank divergence by consequence, not by ugliness. A wildly undocumented but isolated script sits in a low contour; a one-line config drift on a shared load balancer sits high. Resist the instinct to fix what offends you. Fix what radiates.",
      "Red zones — high consequence, actively load-bearing — get remediation plans, owners, and dates. There are usually fewer than five. If your map shows twenty, the audit found an organizational problem wearing a technical costume, and the debrief will have said so out loud.",
      "Amber zones are divergences the business quietly depends on: the undocumented retry, the manual step everyone knows. For each, make one decision — codify or kill. Codifying means the doc changes to match reality, on purpose, with a name attached. What you must not do is leave it amber; amber is where the next outage is currently sleeping.",
      "Green zones are honest documentation. Read them anyway: the pattern of where your docs stayed true is a map of which teams have a writing culture, and that map is worth more than the audit.",
      "Last: date the map. Drift is a rate, not an event, and a map older than two quarters is a souvenir. The point of reading it well once is to need a smaller one next time.",
    ],
    date: "2026-05-02",
    author: "OpenTalon Field Office",
    readMinutes: 6,
    tags: ["audits", "how-to"],
  },
];
