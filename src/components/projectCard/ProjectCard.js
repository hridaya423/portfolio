import React from "react";
import "./ProjectCard.scss";
import { Fade } from "react-reveal";

export default function ProjectCard({ project, isDark }) {
  const {
    name,
    description,
    image,
    demoUrl,
    repoUrl,
    techStack
  } = project;

  function openUrlInNewTab(url) {
    if (!url) {
      console.log(`URL is undefined`);
      return;
    }
    var win = window.open(url, "_blank");
    win.focus();
  }

  return (
    <Fade bottom duration={1000} distance="20px">
      <div className={isDark ? "dark-card-mode project-card-div" : "project-card-div"}>
        <div className="project-card-header">
          <div className="project-image-div">
            <img src={image} alt={name} className="project-image" />
          </div>
          <h3 className="project-name">{name}</h3>
        </div>
        
        <p className="project-description">{description}</p>
        
        <div className="project-tech-stack">
          {techStack.slice(0, 3).map((tech, index) => (
            <span key={index} className="tech-tag">
              {tech}
            </span>
          ))}
          {techStack.length > 3 && (
            <span className="tech-tag more-tag">+{techStack.length - 3}</span>
          )}
        </div>
        
        <div className="project-buttons">
          <button
            className="project-button demo-button"
            onClick={() => openUrlInNewTab(demoUrl)}
            aria-label={`View demo of ${name}`}
          >
            <span>Demo</span>
          </button>
          <button
            className="project-button repo-button"
            onClick={() => openUrlInNewTab(repoUrl)}
            aria-label={`View GitHub repository for ${name}`}
          >
            <span>GitHub</span>
          </button>
        </div>
      </div>
    </Fade>
  );
}