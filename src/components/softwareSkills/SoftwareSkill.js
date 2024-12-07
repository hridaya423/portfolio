import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import './SoftwareSkill.scss';
import { skillsSection } from "../../portfolio";

// Register the MorphSVGPlugin
gsap.registerPlugin(MorphSVGPlugin);

export default function SoftwareSkill() {
  const skillRefs = useRef([]);

  useEffect(() => {
    const liquidMorphAnimation = (element) => {
      const icon = element.querySelector('i');
      const text = element.querySelector('p');
      
      // Create liquid morph SVG
      const liquidSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      liquidSVG.setAttribute('class', 'liquid-morph');
      liquidSVG.style.position = 'absolute';
      liquidSVG.style.top = '0';
      liquidSVG.style.left = '0';
      liquidSVG.style.width = '100%';
      liquidSVG.style.height = '100%';
      liquidSVG.style.zIndex = '-1';
      
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute('fill', element.style.getPropertyValue('--icon-color'));
      path.style.opacity = '0.2';
      liquidSVG.appendChild(path);
      element.appendChild(liquidSVG);

      element.addEventListener('mouseenter', () => {
        // Liquid morph and reveal animation
        gsap.to(icon, {
          scale: 1.2,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });

        gsap.to(text, {
          opacity: 1,
          y: 0,
          duration: 0.5
        });

        // Liquid path morphing
        gsap.to(path, {
          morphSVG: "M20,50 Q50,80 80,50 T140,50",
          fill: element.style.getPropertyValue('--icon-color'),
          opacity: 0.5,
          duration: 0.7,
          ease: 'elastic.out(1, 0.3)'
        });
      });

      element.addEventListener('mouseleave', () => {
        // Revert animations
        gsap.to(icon, {
          scale: 1,
          duration: 0.5,
          ease: 'power2.out'
        });

        gsap.to(text, {
          opacity: 0.7,
          y: 10,
          duration: 0.5
        });

        // Revert liquid path
        gsap.to(path, {
          morphSVG: "M20,50 Q50,50 80,50 T140,50",
          opacity: 0.2,
          duration: 0.7,
          ease: 'power2.out'
        });
      });
    };

    // Apply animations to each skill element
    skillRefs.current.forEach(liquidMorphAnimation);
  }, []);

  return (
    <div>
      <div className="software-skills-main-div">
        <ul className="dev-icons">
          {skillsSection.softwareSkills.map((skills, i) => {
            return (
              <li
                key={i}
                ref={el => skillRefs.current[i] = el}
                className="software-skill-inline"
                name={skills.skillName}
                style={{ "--icon-color": skills.color }}
              >
                <i 
                  className={skills.fontAwesomeClassname}
                ></i>
                <p>{skills.skillName}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}