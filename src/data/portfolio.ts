import { DATA } from "./resume";

export const projects = DATA.projects.map((project) => ({
  ...project,
  alt: `${project.title} interface`,
  // Link to the launch post rather than autoplaying the launch film.
  launch: (project as { launch?: { x: string; linkedin: string } }).launch,
}));

export type IndexEntry = {
  id: string;
  title: string;
  question: string;
  description: string;
  image?: { src: string; width: number; height: number };
  href?: string;
  repo?: string;
};
const gh = (name: string) => `https://github.com/hridaya423/${name}`;
const moreProjects: IndexEntry[] = [
  {
    id: "cue",
    image: { src: "/cue-site.png", width: 3024, height: 1890 },
    title: "Cue",
    question: "paste knew what the field wanted?",
    description: "A Mac clipboard that looks at the field you're pasting into and pulls out just the part that belongs there, like the email address buried inside a chat message.",
    href: "https://cue.hridya.tech",
    repo: gh("cue"),
  },
  {
    id: "perry",
    image: { src: "/projects/perry.jpg", width: 3024, height: 1890 },
    title: "Perry",
    question: "someone could show me where the button is?",
    description: "A free Mac helper tucked into the notch. Ask how to do something and it points to each button as you go, or takes over and finishes the task while you watch.",
    href: "https://perry.hridya.tech",
    repo: gh("perry"),
  },
  {
    id: "quill",
    image: { src: "/projects/quill.jpg", width: 3024, height: 1890 },
    title: "Quill",
    question: "my draft edited itself while I talked?",
    description: "A free Mac Markdown editor built around voice edits. Hold a key, say what should change, and Claude Code, Codex or Cursor rewrites your draft in place for you to keep or revert.",
    href: "https://quill.hridya.tech",
    repo: gh("quill"),
  },
  {
    id: "locus",
    image: { src: "/projects/locus.jpg", width: 1280, height: 900 },
    title: "Locus",
    question: "finding the right dataset took minutes, not days?",
    description: "Describe the omics study you need in plain English. Locus searches 891k public datasets, counts case and control samples in code, and outputs nf-core samplesheets. 1st place at Reinvent the Wheel.",
    repo: gh("locus"),
  },
  {
    id: "gazekeeper",
    image: { src: "/projects/gazekeeper.jpg", width: 3024, height: 1890 },
    title: "GazeKeeper",
    question: "a break reminder knew not to interrupt?",
    description: "A Mac break reminder that reads the room. It holds off during calls and screen shares, then waits for a natural pause in your typing.",
    href: "https://gazekeeper.hridya.tech",
    repo: gh("gazekeeper"),
  },
  {
    id: "fineprint",
    title: "Fineprint",
    question: "the terms came with a translator?",
    description: "A fine-tuned 1.2B model running locally on your laptop that scans terms of service for clauses that cost you money or rights. White Circle track winner and 2nd overall at Moonfire Build Night.",
    repo: gh("fineprint"),
  },
  {
    id: "waypoint",
    image: { src: "/projects/waypoint.jpg", width: 1505, height: 1045 },
    title: "Waypoint",
    question: "directions lived in your glasses?",
    description: "Hands-free London walking and bus directions for Even G2 smart glasses: walk to the stop, follow the ride, and get a nudge before yours comes up.",
    repo: gh("waypoint-g2"),
  },
  {
    id: "indict",
    image: { src: "/projects/indict.jpg", width: 1536, height: 1024 },
    title: "Indict",
    question: "the model guessed the bugs and mechanics proved them?",
    description: "Runs six vulnerability-hunting engines over a repo and only calls a bug verified once a sandboxed proof of concept actually hits the reported line.",
    repo: gh("indict"),
  },
  {
    id: "devingoal",
    image: { src: "/projects/devingoal.jpg", width: 1024, height: 576 },
    title: "/goal for Devin",
    question: "an agent couldn't stop until the work was proven?",
    description: "Stops Devin from quitting early by checking every completion claim in a separate read-only judge session against the actual repository.",
    repo: gh("devingoal"),
  },
  {
    id: "deepgreen",
    image: { src: "/projects/deepgreen.jpg", width: 2000, height: 1250 },
    title: "Deep Green",
    question: "a 6 MB network played perfect Wordle?",
    description: "A 6.2 MB neural network running in your browser that matches an exact optimal Wordle solver move for move, seeing nothing but the public board.",
    href: "https://deepgreen.hridya.tech",
    repo: gh("deepgreen"),
  },
  {
    id: "usage-dash",
    image: { src: "/projects/usage-dash.jpg", width: 1024, height: 709 },
    title: "usage-dash",
    question: "every machine's agent usage fit on one screen?",
    description: "Pulls coding-agent token and cost usage from every machine you own over SSH into one web dashboard and Mac menu-bar popover.",
    repo: gh("usage-dash"),
  },
  {
    id: "hermes-g2",
    image: { src: "/projects/hermes-g2.jpg", width: 1774, height: 887 },
    title: "Hermes G2",
    question: "your own agent lived in your glasses?",
    description: "A private Even G2 glasses client for talking to and approving actions from my self-hosted Hermes agent, without ever putting the API key on the device.",
    repo: gh("hermes-even-g2"),
  },
  {
    id: "neurix",
    image: { src: "/projects/neurix.jpg", width: 2000, height: 1250 },
    title: "Neurix",
    question: "block code kept going past the beginner demos?",
    description: "A Scratch-style block editor where AI generates and explains editable blocks instead of dumping raw code you can't tweak.",
    href: "https://neurix.hridya.tech",
    repo: gh("neurix"),
  },
];
export const projectIndex: IndexEntry[] = [
  ...projects.map(({ id, title, question, description, href, repo, image, previewWidth, previewHeight }) => ({
    id,
    title,
    question,
    description,
    href,
    repo,
    image: { src: image, width: previewWidth, height: previewHeight },
  })),
  ...moreProjects,
];
export type PortfolioEvent = {
  id: string;
  city: string;
  country: string;
  title: string;
  date: string;
  description: string;
  href: string;
  game?: { title: string; href?: string; repo: string };
  project?: { title: string; repo: string; story?: string };
  award?: string;
  // Defaults to the city, for events that weren't a trip.
  label?: string;
  cloud?: string;
  lead?: boolean;
};
export const events: PortfolioEvent[] = [
  {
    id: "problem-day",
    city: "London",
    country: "United Kingdom",
    title: "the PROBLEM day",
    date: "31 October 2026",
    description:
      "Built Myna with my team at Kickstart's PROBLEM day in London: an enterprise computer-use agent that redacts sensitive data locally before anything leaves your machine, routes each step to the right model, watches how you work to spot automatable tasks, and turns a screen recording into a repeatable workflow. We finished runner-up.",
    href: "https://luma.com/mczagntt",
    award: "Runner-up",
    label: "the PROBLEM day",
    cloud: "2ND",
  },
  {
    id: "moonfire-build-night",
    city: "London",
    country: "United Kingdom",
    title: "Moonfire Build Night",
    date: "22 October 2026",
    description:
      "Built Fineprint in three hours with Mukesh Agrawal at Moonfire Build Night in London. We fine-tuned a 1.2B model with White Circle's Halo on a single H200 so it can scan terms of service locally on your laptop and flag costly clauses. It won the White Circle track and came 2nd overall.",
    href: "https://community.venturecafelondon.org/events/103",
    project: { title: "Fineprint", repo: "https://github.com/hridaya423/fineprint", story: "fineprint" },
    award: "White Circle track winner, 2nd overall",
    label: "Moonfire Build Night",
    cloud: "WINNER",
  },
  {
    id: "reinvent-the-wheel",
    city: "London",
    country: "United Kingdom",
    title: "Reinvent the Wheel",
    date: "16–18 October 2026",
    description:
      "Built Locus with a team at Reinvent the Wheel, a Tools for Science hackathon in King's Cross. Describe the biological dataset you need in plain English: it searches 891k public datasets across 18 repositories, counts case and control samples in code, and outputs nf-core samplesheets. We took 1st place and the £1,000 grand prize.",
    href: "https://luma.com/vdq0qw9u",
    project: { title: "Locus", repo: "https://github.com/hridaya423/locus", story: "locus" },
    award: "1st place",
    label: "Reinvent the Wheel",
    cloud: "1ST",
    lead: true,
  },
  {
    id: "open-sauce",
    city: "San Francisco",
    country: "United States",
    title: "Open Sauce",
    date: "17–19 July 2026",
    description:
      "Spent a weekend at Open Sauce 2026 at the San Mateo County Event Center in the Bay Area, taking in hardware builds, demos and talks.",
    href: "https://www.opensauce.com/",
  },
  {
    id: "shiba",
    city: "Tokyo",
    country: "Japan",
    title: "Shiba",
    date: "November 2025",
    description:
      "Spent 120 hours building Whisper for Hack Club's Shiba, then flew to Tokyo to build a real arcade cabinet for it and show it to locals.",
    href: "https://shiba.hackclub.com",
    game: {
      title: "Whisper",
      repo: "https://github.com/hridaya423/whisper",
    },
  },
  {
    id: "juice",
    city: "Shanghai",
    country: "China",
    title: "Juice",
    date: "April 2025",
    description:
      "Spent 100 hours building Undead Courier for Hack Club's Juice, then took it to a gaming pop-up café in Shanghai for people to play.",
    href: "https://juice.hackclub.com",
    game: {
      title: "Undead Courier",
      href: "https://undeadcourier.hridya.tech/",
      repo: "https://github.com/hridaya423/undeadcourier",
    },
  },
];
export const credentials = DATA.achievements.map((credential) => ({
  ...credential,
  href: credential.link,
  detail: credential.subtitle,
}));
export type Credential = (typeof credentials)[number];
export const experience = DATA.work;
