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
        <div className="project-image-div">
          <img src={image} alt={name} className="project-image" />
        </div>
        <div className="project-detail-div">
          <h3 className="project-name">{name}</h3>
          <p className="project-description">{description}</p>
          
          <div className="project-tech-stack">
            {techStack.map((tech, index) => (
              <span key={index} className="tech-tag">
                {tech}
              </span>
            ))}
          </div>
          
          <div className="project-buttons">
            <button
              className="project-button demo-button"
              onClick={() => openUrlInNewTab(demoUrl)}
            >
              Demo
            </button>
            <button
              className="project-button repo-button"
              onClick={() => openUrlInNewTab(repoUrl)}
            >
              GitHub
            </button>
          </div>
        </div>
      </div>
    </Fade>
  );
}