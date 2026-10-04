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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(video);

    const unmute = () => {
      video.muted = false;
    };

    if (navigator.userActivation?.hasBeenActive) {
      unmute();
    } else {
      // First real gesture anywhere on the page turns sound on.
      const onGesture = (event: Event) => {
        if ((event.target as Element | null)?.closest?.(".sound-toggle")) return;
        unmute();
        window.removeEventListener("pointerdown", onGesture, true);
        window.removeEventListener("keydown", onGesture, true);
        window.removeEventListener("touchstart", onGesture, true);
      };
      window.addEventListener("pointerdown", onGesture, true);
      window.addEventListener("keydown", onGesture, true);
      window.addEventListener("touchstart", onGesture, true);
      return () => {
        observer.disconnect();
        video.removeEventListener("volumechange", sync);
        window.removeEventListener("pointerdown", onGesture, true);
        window.removeEventListener("keydown", onGesture, true);
        window.removeEventListener("touchstart", onGesture, true);
      };
    }

    return () => {
      observer.disconnect();
      video.removeEventListener("volumechange", sync);
    };
  }, []);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }

  return (
    <>
      <a href={href} className="project-preview" aria-label={label}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop
          muted
          playsInline
          width={width}
          height={height}
        />
      </a>
      <button
        type="button"
        className="sound-toggle"
        onClick={toggleSound}
        aria-label={muted ? "Play sound" : "Mute sound"}
        aria-pressed={!muted}
      >
        {muted ? <VolumeX width={20} height={20} /> : <Volume2 width={20} height={20} />}
      </button>
    </>
  );
}
