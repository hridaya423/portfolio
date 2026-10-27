import type { Metadata } from "next";
import { DATA } from "@/data/resume";
import { Footer } from "@/components/portfolio/sections";
import { ProjectIndex } from "@/components/portfolio/project-index";
import { monoFont, portfolioFont } from "@/components/portfolio/font";
import "@/components/portfolio/portfolio.css";

export const metadata: Metadata = {
  title: "Projects",
  description: `Every project ${DATA.name} has built: apps, tools, games and hackathon builds.`,
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <main className={`portfolio-home ${portfolioFont.variable} ${monoFont.variable}`}>
      <ProjectIndex />
      <Footer />
    </main>
  );
}
