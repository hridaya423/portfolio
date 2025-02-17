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
    image: "https://cloud-3eqm8owqp-hack-club-bot.vercel.app/0image.png",
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
    id: "7",
    name: "URL Shortener",
    description: "A sleek, modern URL shortening service",
    image: "https://cloud-kj6yptuwl-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://urlshortener.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/urlshortener",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "8",
    name: "QR Code Generator",
    description: "A modern, user-friendly QR Code Generator",
    image: "https://cloud-850cgly3n-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://qrcodegen.hridya.tech",
    repoUrl: "https://github.com/hridaya423/qrcodegenerator",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "9",
    name: "Weatheristic",
    description: "Weatheristic is a modern, responsive weather application that provides real-time weather information",
    image: "https://cloud-6b2ippkmm-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://weatheristic.hridya.tech",
    repoUrl: "https://github.com/hridaya423/weatheristic",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "10",
    name: "Magic Speech",
    description: "Magic Speech is a Next.js web application that provides advanced speech processing capabilities",
    image: "https://cloud-iw2rzomfe-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://magicspeech.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/magicspeech",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "11",
    name: "Objectify",
    description: "Objectify is an advanced object detection web application powered by TensorFlow's COCO-SSD",
    image: "https://cloud-fhubke6oq-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://objectify.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/objectify",
    techStack: ["Next.js", "Tensorflow"],
    featured: false
  },
  {
    id: "12",
    name: "I know how you are feeling",
    description: "Sentiment Analyzer with Next.js, but gives cheerful messages based on emotion",
    image: "https://cloud-uziugv1g4-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://facepal.hridya.tech",
    repoUrl: "https://github.com/hridaya423/facepal",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "13",
    name: "FacePal",
    description: "FacePal is a cutting-edge web application that leverages machine learning for real-time face detection and recognition.",
    image: "https://cloud-856mgc96h-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://maroon.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/maroon",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "14",
    name: "Sudoku Solver",
    description: "A Sudoku Solver application that allows users to input a Sudoku puzzle and automatically solves it.",
    image: "https://cloud-g47l7rtmp-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://sudokusolver.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/sudokusolver",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "15",
    name: "Cyberpunk Arcade",
    description: "Welcome to the Cyberpunk Arcade - a neon-drenched digital playground featuring classic games with a futuristic twist!",
    image: "https://cloud-3lrz63wdh-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://cyberpunkarcade.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/cyberpunkarcade",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "16",
    name: "ZenQuotes",
    description: "Zen Quotes is a visually stunning Next.js application that generates inspirational quotes with interactive features, and immersive design.",
    image: "https://cloud-88i5cguxu-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://randomquote.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/quotegenerator",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "17",
    name: "Foody",
    description: "Foody is a full-stack recipe management application that allows users to explore recipes",
    image: "https://cloud-n69ne3jyl-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https://foody.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/foody",
    techStack: ["Next.js"],
    featured: false
  },
  {
    id: "18",
    name: "Moody",
    description: "Welcome to the Cyberpunk Arcade - a neon-drenched digital playground featuring classic games with a futuristic twist!",
    image: "https://cloud-qezh34qvk-hack-club-bot.vercel.app/0image.png",
    demoUrl: "https:/moody.hridya.tech/",
    repoUrl: "https://github.com/hridaya423/moody",
    techStack: ["Next.js"],
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