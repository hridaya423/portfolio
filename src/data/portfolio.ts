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
    description: "A macOS clipboard that reads the field you're in and pastes only the part that fits, like just the email from a whole message.",
    href: "https://cue.hridya.tech",
    repo: gh("cue"),
  },
  {
    id: "locus",
    image: { src: "/projects/locus.jpg", width: 1280, height: 900 },
    title: "Locus",
    question: "finding the right dataset took minutes, not days?",
    description: "Ask for public omics datasets in plain English. It searches 891k of them, counts case and control samples, and writes the nf-core samplesheets. 1st place at Reinvent the Wheel.",
    repo: gh("locus"),
  },
  {
    id: "gazekeeper",
    title: "GazeKeeper",
    question: "a break reminder knew not to interrupt?",
    description: "A break reminder for the Mac that holds the break during calls and screen shares, then waits for a pause in your typing.",
    repo: gh("gazekeeper"),
  },
  {
    id: "fineprint",
    title: "Fineprint",
    question: "the terms came with a translator?",
    description: "Reads terms of service on your own laptop and flags the clauses that cost you money or rights, with a 1.2B model fine-tuned for it. White Circle track winner and 2nd overall at Moonfire Build Night.",
    repo: gh("fineprint"),
  },
  {
    id: "waypoint",
    image: { src: "/projects/waypoint.jpg", width: 1505, height: 1045 },
    title: "Waypoint",
    question: "directions lived in your glasses?",
    description: "London walking and bus directions for Even G2 glasses: walk to the stop, follow the ride, get a reminder before yours.",
    repo: gh("waypoint-g2"),
  },
  {
    id: "indict",
    image: { src: "/projects/indict.jpg", width: 1536, height: 1024 },
    title: "Indict",
    question: "the model guessed the bugs and mechanics proved them?",
    description: "Runs several vulnerability-hunting engines over a repository and writes one report. The model proposes, mechanics decide.",
    repo: gh("indict"),
  },
  {
    id: "devingoal",
    image: { src: "/projects/devingoal.jpg", width: 1024, height: 576 },
    title: "/goal for Devin",
    question: "an agent couldn't stop until the work was proven?",
    description: "Keeps Devin working until an independent judge checks the outcome against the real repository, not until the model feels done.",
    repo: gh("devingoal"),
  },
  {
    id: "deepgreen",
    image: { src: "/projects/deepgreen.jpg", width: 2000, height: 1250 },
    title: "Deep Green",
    question: "a 6 MB network played perfect Wordle?",
    description: "A small neural network that plays Wordle move for move like a certified optimal solver, seeing only the public board.",
    href: "https://deepgreen-xi.vercel.app",
    repo: gh("deepgreen"),
  },
  {
    id: "usage-dash",
    image: { src: "/projects/usage-dash.jpg", width: 1024, height: 709 },
    title: "usage-dash",
    question: "every machine's agent usage fit on one screen?",
    description: "One dashboard for coding-agent usage across every machine you own, on the web and in the menu bar.",
    repo: gh("usage-dash"),
  },
  {
    id: "hermes-g2",
    image: { src: "/projects/hermes-g2.jpg", width: 1774, height: 887 },
    title: "Hermes G2",
    question: "your own agent lived in your glasses?",
    description: "A private client for a self-hosted Hermes agent, built for Even G2 glasses.",
    repo: gh("hermes-even-g2"),
  },
  {
    id: "neurix",
    image: { src: "/projects/neurix.jpg", width: 2000, height: 1250 },
    title: "Neurix",
    question: "block code kept going past the beginner demos?",
    description: "A Scratch-style block editor meant for real games, with AI that writes and explains blocks.",
    href: "https://neurix-xi.vercel.app",
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
  game?: { title: string; href: string; repo: string };
  project?: { title: string; repo: string };
  award?: string;
  // Defaults to the city, for events that weren't a trip.
  label?: string;
  cloud?: string;
};
export const events: PortfolioEvent[] = [
  {
    id: "reinvent-the-wheel",
    city: "London",
    country: "United Kingdom",
    title: "Reinvent the Wheel",
    date: "16–18 October 2026",
    description:
      "Built Locus at Reinvent the Wheel, a Tools for Science hackathon in King's Cross. Ask for public datasets in plain English: it searches 891k of them across 18 repositories, counts case and control samples, and writes the nf-core samplesheets. It won 1st place and the £1,000 grand prize.",
    href: "https://luma.com/vdq0qw9u",
    project: { title: "Locus", repo: "https://github.com/hridaya423/locus" },
    award: "1st place",
    label: "Reinvent the Wheel",
    cloud: "1ST",
  },
  {
    id: "moonfire-build-night",
    city: "London",
    country: "United Kingdom",
    title: "Moonfire Build Night",
    date: "22 October 2026",
    description:
      "Built Fineprint at Moonfire's Build Night in London: a 1.2B model, fine-tuned with White Circle's Halo on one H200, that reads terms of service on your own laptop and flags the clauses that cost you money or rights. It won the White Circle track and came 2nd overall.",
    href: "https://community.venturecafelondon.org/events/103",
    project: { title: "Fineprint", repo: "https://github.com/hridaya423/fineprint" },
    award: "White Circle track winner, 2nd overall",
    label: "Moonfire Build Night",
    cloud: "WINNER",
  },
  {
    id: "juice",
    city: "Shanghai",
    country: "China",
    title: "Juice",
    date: "April 2025",
    description:
      "Made Undead Courier for Juice: 100 hours building a game, then showing it at a gaming pop-up café in Shanghai.",
    href: "https://juice.hackclub.com",
    game: {
      title: "Undead Courier",
      href: "https://undeadcourier.hridya.tech/",
      repo: "https://github.com/hridaya423/undeadcourier",
    },
  },
  {
    id: "shiba",
    city: "Tokyo",
    country: "Japan",
    title: "Shiba",
    date: "November 2025",
    description:
      "Made Whisper for Shiba: 120 hours building a game, then building an arcade machine for it in Tokyo.",
    href: "https://shiba.hackclub.com",
    game: {
      title: "Whisper",
      href: DATA.hackathons[1].links[1].href,
      repo: "https://github.com/hridaya423/whisper",
    },
  },
  {
    id: "open-sauce",
    city: "San Francisco",
    country: "United States",
    title: "Open Sauce",
    date: "17–19 July 2026",
    description: "Open Sauce 2026, at the San Mateo County Event Center in the San Francisco Bay Area.",
    href: "https://www.opensauce.com/",
  },
];
export const credentials = DATA.achievements.map((credential) => ({
  ...credential,
  href: credential.link,
  detail: credential.subtitle,
}));
export type Credential = (typeof credentials)[number];
export const experience = DATA.work;
