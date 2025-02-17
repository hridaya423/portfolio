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
  const [showMore, setShowMore] = useState(false);

  const displayedProjects = showMore ? projectsData : projectsData.filter(project => project.featured);

  return (
    <div className="main" id="projects">
      <h1 className="project-title">My Projects</h1>
      <div className="project-cards-div-main">
        {displayedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isDark={isDark}
          />
        ))}
      </div>
      {!showMore && (
        <Button
          text={"Show More"}
          className="project-button"
          onClick={() => setShowMore(true)}
        />
      )}
      <Button
        text={"View All Projects on GitHub"}
        className="project-button github-button"
        href={socialMediaLinks.github}
        newTab={true}
      />
    </div>
  );
}