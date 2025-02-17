import React, { useState, useContext } from "react";
import "./Project.scss";
import Button from "../../components/button/Button";
import { socialMediaLinks } from "../../portfolio";
import StyleContext from "../../contexts/StyleContext";
import ProjectCard from "../../components/projectCard/ProjectCard";

const projectsData = [
  {
    id: "project1",
    name: "Test",
    description: "Test",
    image: "/images/projects/Test.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/test/Test",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Redux"],
    featured: true
  },
  {
    id: "project2",
    name: "Test",
    description: "Test",
    image: "/images/projects/Test.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/test/Test",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Redux"],
    featured: true
  },
  {
    id: "project3",
    name: "Test",
    description: "Test",
    image: "/images/projects/Test.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/test/Test",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Redux"],
    featured: true
  },
  {
    id: "project4",
    name: "Test",
    description: "Test",
    image: "/images/projects/Test.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/test/Test",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Redux"],
    featured: true
  },
  {
    id: "project5",
    name: "Test",
    description: "Test",
    image: "/images/projects/Test.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/test/Test",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Redux"],
    featured: true
  },
  {
    id: "project6",
    name: "Test",
    description: "Test",
    image: "/images/projects/Test.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/test/Test",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Redux"],
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
    featured: true
  },
  {
    id: "project8",
    name: "Test",
    description: "Test",
    image: "/images/projects/Test.png",
    demoUrl: "https://demo.example.com",
    repoUrl: "https://github.com/test/Test",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Redux"],
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
  
  // Filter out only featured projects for initial display
  const featuredProjects = projectsData.filter(project => project.featured);
  
  // Show either featured projects or all projects based on showAll state
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
      <a
        href={socialMediaLinks.github}
        target="_blank"
        rel="noopener noreferrer"
        className="view-all-button"
      >
        VIEW ALL PROJECTS ON GITHUB
      </a>
    </div>
  );
}