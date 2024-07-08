import React from "react";
import "./SoftwareSkill.scss";
import { skillsSection } from "../../portfolio";

export default function SoftwareSkill() {
  return (
    <div>
      <div className="software-skills-main-div">
        <ul className="dev-icons">
          {skillsSection.softwareSkills.map((skills, i) => {
            return (
              <li
                key={i}
                className="software-skill-inline"
                name={skills.skillName}
              >
                <div className="skill-logo">
                  <i className={skills.fontAwesomeClassname} style={{ color: skills.color }}></i>
                  <div className="skill-hover" style={{ backgroundColor: skills.color }}></div>
                </div>
                <p>{skills.skillName}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
