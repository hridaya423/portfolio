import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Hridya Agrawal",
  initials: "HA",
  url: "https://hridya.tech",
  location: "London, UK",
  locationLink: "https://www.google.com/maps/place/London,+UK",
  description:
    "A skilled Full Stack Developer proficient in JavaScript, React.js, Python, and Flutter. Passionate about creating innovative web and mobile applications that deliver exceptional user experiences through cutting-edge technologies.",
  summary:
    "",
  avatarUrl: "/me.png",
  skills: [
    "JavaScript",
    "React.js",
    "Python",
    "Flutter",
    "Node.js",
    "Express.js",
    "Firebase",
    "AWS",
    "Digital Ocean",
    "OpenAI",
    "Azure",
    "Supabase",
    "Google Cloud",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "Kubernetes",
    "Java",
    "C++",
    "n8n"
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "hridyaagrawal4@gmail.com",
    tel: "",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/hridaya423",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/hridya-agrawal-067236317/",
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/AgrawalHridaya",
        icon: Icons.x,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:hridyaagrawal4@gmail.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },
  work: [
    {
      company: "Hack Club",
      href: "https://hackclub.com",
      badges: ["Volunteer"],
      location: "Remote",
      title: "Volunteer",
      logoUrl: "https://assets.hackclub.com/icon-rounded.png",
      start: "Aug 2025",
      end: null,
      description: "Performing fraud checks and order reviews. Checking for inflated and fraudulent time, low quality projects. Managing bans, appeals, and ensuring community integrity.",
    },
  ],
  education: [
  ],
  projects: [
    {
      title: "Lexis",
      description: "Talk To Your Terminal. Describe what you need in plain language. Lexis translates the request into platform-aware shell commands with risk checks before execution.",
      image: "https://github.com/user-attachments/assets/66a8838b-026b-4f6b-8e29-cc4769638eb5",
      href: "https://lexis.hridya.tech",
      technologies: ["CLI", "Shell"],
    },
    {
      title: "Neurobits",
      description: "A Flutter-based brain training app with AI-generated learning challenges, personalized learning paths, and daily challenges. Duolingo for everything - learn any topic, any time.",
      image: "https://raw.githubusercontent.com/hridaya423/portfolio/refs/heads/main/public/Screenshot%202026-01-22%20at%2021.55.48.png",
      href: "https://neurobits.hridya.tech",
      repo: "https://github.com/hridaya423/neurobits",
      technologies: ["Flutter", "AI", "Supabase"],
    },
    {
      title: "Maroon",
      description: "A pirate-themed esoteric programming language that makes coding as adventurous as sailing the high seas! Features unique syntax inspired by pirate parlance.",
      image: "https://raw.githubusercontent.com/hridaya423/portfolio/refs/heads/main/public/Screenshot%202026-01-22%20at%2021.56.03.png",
      href: "https://maroon.hridya.tech",
      repo: "https://github.com/hridaya423/maroon",
      technologies: ["Python", "Next.js"],
    },
    {
      title: "Undead Courier",
      description: "A zombie apocalypse game where you navigate through a post-apocalyptic world as a courier.",
      image: "https://raw.githubusercontent.com/hridaya423/portfolio/refs/heads/main/public/Screenshot%202026-01-22%20at%2021.56.18.png",
      href: "https://undeadcourier.hridya.tech",
      repo: "https://github.com/hridaya423/undeadcourier",
      technologies: ["Unity", "C#"],
    },
  ],
  hackathons: [
    {
      title: "Juice",
      description: "Built a game in 100 hours, and went to Shanghai for a gaming popup cafe!",
      location: "Hybrid",
      dates: "April 2025",
      image: "https://github.com/hackclub/juice/raw/main/site/public/juicebigimage.png",
      links: [
        {
          icon: Icons.github({}),
          type: "repo",
          href: "https://github.com/hridaya423/undeadcourier",
        },
        {
          icon: Icons.globe({}),
          type: "website",
          href: "https://undeadcourier.hridya.tech/",
        },
      ],
    },
    {
      title: "Shiba",
      description: "Built a game in 120 hours, and went to Tokyo to build a arcade machine and presented to locals!",
      location: "Hybrid",
      dates: "Nov 2025",
      image: "https://shiba.hackclub.com/SpeedyShibaShipper.png",
      links: [
        {
          icon: Icons.github({}),
          type: "repo",
          href: "https://github.com/hridaya423/whisper",
        },
        {
          icon: Icons.globe({}),
          type: "website",
          href: "https://tc8ckgo4kskk48s0o8cwc0g8.a.selfhosted.hackclub.com/play/019a41d9-ce39-79e2-868f-2ff8eecafea3/",
        },
      ],
    },
  ],
  achievements: [
    {
      title: "AZ-900",
      subtitle: "Achieved AZ-900 Microsoft certification at age 11",
      image: "/az-900.png",
      link: "https://www.credly.com/badges/c2d19134-47d4-4ded-a7cf-12e6455c29ff",
    },
    {
      title: "DP-900",
      subtitle: "Achieved DP-900 Microsoft certification at age 11",
      image: "/dp-900.png",
      link: "https://www.credly.com/badges/512c8f33-bace-4676-af29-2e7c0a027911",
    },
    {
      title: "AI-900",
      subtitle: "Achieved AI-900 Microsoft certification at age 11",
      image: "/ai-900.png",
      link: "https://www.credly.com/badges/008c2b1f-53e5-4548-9ceb-b1e7aac41d81",
    },
    {
      title: "SC-900",
      subtitle: "Achieved SC-900 Microsoft certification at age 11",
      image: "/sc-900.png",
      link: "https://www.credly.com/badges/42bb3fbe-91c7-4af9-af34-15e2d8d3662f",
    },
    {
      title: "PL-900",
      subtitle: "Achieved PL-900 Microsoft certification at age 11",
      image: "/pl-900.png",
      link: "https://www.credly.com/badges/c1b54442-8027-4bf2-97d5-38b793281b9e",
    },
    {
      title: "PL-100",
      subtitle: "Achieved PL-100 Microsoft certification at age 11",
      image: "/pl-100.png",
      link: "https://www.credly.com/badges/b5c3ad33-0cb4-4496-9719-472ed6433d8c",
    },
    {
      title: "Pega Certified System Architect",
      subtitle: "Achieved Pega CSA certification at age 11 (verify with email: hridayahoney@gmail.com)",
      image: "/pega.png",
      link: "https://academy.pega.com/verify-certification",
    },
    {
      title: "Oracle Gen AI",
      subtitle: "Achieved Oracle Gen AI certification at age 13",
      image: "/e.png",
      link: "https://t.co/OumPKteDbd",
    },
    {
      title: "Github Foundations",
      subtitle: "Achieved Github Foundations certification at age 13",
      image: "/g-found.png",
      link: "https://www.credly.com/badges/19280ad5-3220-4505-b5c9-12044ccfed0e/public_url",
    },
  ],
}
