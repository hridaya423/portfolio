"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function ProjectVideo({
  href,
  src,
  poster,
  label,
  width,
  height,
}: {
  href: string;
  src: string;
  poster: string;
  label: string;
  width: number;
  height: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = 0.6;
    const sync = () => setMuted(video.muted);
    video.addEventListener("volumechange", sync);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    // Loads and plays only while on screen; reduced motion keeps the poster.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduced.matches)
          void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.removeEventListener("volumechange", sync);
    };
  }, []);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.paused) void video.play().catch(() => {});
  }

  return (
    <>
      <a href={href} className="project-frame" aria-label={label}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop
          muted
          playsInline
          preload="none"
          width={width}
          height={height}
        />
      </a>
      <button
        type="button"
        className="media-button sound-toggle"
        onClick={toggleSound}
        aria-label={muted ? "Play sound" : "Mute sound"}
        aria-pressed={!muted}
      >
        {muted ? <VolumeX width={20} height={20} /> : <Volume2 width={20} height={20} />}
      </button>
    </>
  );
}
