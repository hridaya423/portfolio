import React, { useState, useContext } from "react";
import "./Project.scss";
import Button from "../../components/button/Button";
import { socialMediaLinks } from "../../portfolio";
import StyleContext from "../../contexts/StyleContext";
import ProjectCard from "../../components/projectCard/ProjectCard";

const projectsData = [
  {
    id: "1",
    name: "Maroon",
    description: "Maroon is a pirate-themed programming language that makes coding adventurous",
    image: "https://cloud-856mgc96h-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://maroon.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/maroon",
    techStack: ["Python", "Next.js"],
    featured: true
  },
  {
    id: "2",
    name: "FortOS",
    description: "FortOS is a sleek, innovative web operating system inspired by the world of Fortnite.",
    image: "https://cloud-7yjp7vvjt-hack-club-bot.vercel.app/0cover.png",
    demoUrl: "https://fortos.hridya.tech",
    repoUrl: "https://github.com/hridaya423/fortos",
    techStack: ["React", "Vite"],
    featured: true
  },
  {
    id: "3",
    name: "Bookify",
    description: "Bookify is a modern web application that helps readers track their books, set reading goals, and discover new recommendations.",
    image: "https://cloud-edrc8ltko-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://bookify.hridya.tech",
    repoUrl: "https://github.com/hridaya423/bookify",
    techStack: ["Next.js", "Supabase", "Tailwind CSS", "Anthropic"],
    featured: true
  },
  {
    id: "4",
    name: "MoodMap",
    description: "MoodMap is a real-time global sentiment analysis platform that visualizes worldwide social sentiment through an interactive map interface.",
    image: "https://cloud-1lzin8fmy-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://moodmap.hridya.tech",
    repoUrl: "https://github.com/hridaya423/moodmap",
    techStack: ["Next.js", "Supabase"],
    featured: true
  },
  {
    id: "5",
    name: "DevForge",
    description: "A comprehensive suite of developer tools",
    image: "/images/projects/Test.png",
    demoUrl: "https://devforge.hridya.tech",
    repoUrl: "https://github.com/hridaya423/devforge",
    techStack: ["Next.js", "Tailwind CSS"],
    featured: true
  },
  {
    id: "6",
    name: "GitScape",
    description: "A sleek and modern GitHub profile analyzer",
    image: "https://cloud-mprs95zto-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://gitscape.hridya.tech",
    repoUrl: "https://github.com/hridaya423/gitscape",
    techStack: ["Next.js", "Tailwind CSS"],
    featured: true
  },
  {
    id: "project7",
    name: "Test",
    description: "Test",
    image: "/images/projects/Test.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/test/Test",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Redux"],
    featured: false
  },
  {
    id: "8",
    name: "QR Code Generator",
    description: "A modern, user-friendly QR Code Generator",
    image: "https://cloud-850cgly3n-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/hridaya423/qrcodegenerator",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "project9",
    name: "Test",
    description: "Test",
    image: "/images/projects/Test.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/test/Test",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Redux"],
    featured: false
  },
];

export default function Projects() {
  const { isDark } = useContext(StyleContext);
  const [showAll, setShowAll] = useState(false);
  
  const featuredProjects = projectsData.filter(project => project.featured);
  const displayedProjects = showAll ? projectsData : featuredProjects;

  const handleShowMore = () => {
    setShowAll(true);
  };

  return (
    <div className="main" id="projects">
      <h1 className="project-title">My Projects</h1>
      <div className="project-cards-grid">
        {displayedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isDark={isDark}
          />
        ))}
      </div>
      {!showAll && featuredProjects.length < projectsData.length && (
        <button
          className="show-more-button"
          onClick={handleShowMore}
        >
          SHOW MORE
        </button>
      )}
    </div>
  );
}