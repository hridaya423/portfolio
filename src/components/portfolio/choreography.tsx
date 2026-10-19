"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// One motion vocabulary for the whole page.
const EASE = "power4.out";
const SOFT = "power2.inOut";
const ENTER = "top 86%";

/**
 * Page-wide choreography over server-rendered markup. Everything it touches is
 * already visible without JavaScript; under reduced motion it does nothing and
 * the page renders in its final state with native scrolling.
 */
export function Choreography() {
  useEffect(() => {
    const root = document.documentElement;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.remove("motion-ok");
      return;
    }
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const lenis = new Lenis({ anchors: true, lerp: 0.11 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Release the CSS pre-hide and build every from-state in the same task,
    // so the hero never paints in between.
    root.classList.add("motion-live");

    const context = gsap.context(() => {
      const intro = gsap.timeline({
        defaults: { ease: EASE },
        onComplete: () => document.querySelectorAll(".hero-line").forEach((line) => line.classList.add("is-open")),
      });
      intro
        .from(".hero-line-inner", { yPercent: 112, duration: 1.15, stagger: 0.1 }, 0.05)
        .from(".hero-intro", { y: 14, autoAlpha: 0, duration: 0.9, stagger: 0.08, clearProps: "all" }, 0.5)
        .from(".tray-base, .tray-lip", { y: 36, autoAlpha: 0, duration: 1.3, clearProps: "all" }, 0.25)
        .from(
          ".tray-tab",
          {
            y: -70,
            rotation: (index: number) => [-7, 5, -4][index] ?? 0,
            autoAlpha: 0,
            duration: 0.9,
            ease: "back.out(1.35)",
            stagger: 0.09,
            clearProps: "transform,opacity,visibility",
          },
          0.75,
        );

      gsap.to(".optical-tray", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ".optical-hero", start: "top top", end: "bottom top", scrub: true },
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="words"]').forEach((heading) => {
        SplitText.create(heading, {
          type: "lines,words",
          mask: "lines",
          autoSplit: true,
          onSplit(split) {
            // Line masks clip by default; give descenders room to hang.
            gsap.set(split.masks, { paddingBottom: "0.14em", marginBottom: "-0.14em" });
            return gsap.from(split.words, {
              yPercent: 115,
              duration: 1.05,
              ease: EASE,
              stagger: 0.045,
              scrollTrigger: { trigger: heading, start: ENTER, once: true },
            });
          },
        });
      });

      ScrollTrigger.batch('[data-reveal="fade"]', {
        start: ENTER,
        once: true,
        onEnter: (batch) =>
          gsap.from(batch, { autoAlpha: 0, y: 8, duration: 0.8, ease: EASE, stagger: 0.06, clearProps: "all" }),
      });

      ScrollTrigger.batch('[data-reveal="rise"], .trip', {
        start: ENTER,
        once: true,
        onEnter: (batch) =>
          gsap.from(batch, { autoAlpha: 0, y: 26, duration: 1, ease: EASE, stagger: 0.07, clearProps: "all" }),
      });

      // Media surfaces out of a feathered edge, then the mask is dropped.
      gsap.utils.toArray<HTMLElement>('[data-reveal="media"]').forEach((media) => {
        const image = media.querySelector("img, video");
        media.classList.add("is-masking");
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: media, start: "top 90%", once: true },
          onComplete: () => media.classList.remove("is-masking"),
        });
        timeline
          .fromTo(media, { "--mask-y": "100%" }, { "--mask-y": "0%", duration: 1.5, ease: SOFT })
          .from(image, { scale: 1.07, duration: 1.8, ease: EASE, clearProps: "transform" }, 0);
      });

      // Handwritten notes write themselves, then the arrow is drawn.
      gsap.utils.toArray<HTMLElement>('[data-reveal="note"]').forEach((note) => {
        const text = note.querySelector("p");
        const paths = note.querySelectorAll("path");
        const timeline = gsap.timeline({ scrollTrigger: { trigger: note, start: ENTER, once: true } });
        timeline.fromTo(
          text,
          { clipPath: "inset(-20% 100% -20% 0)" },
          { clipPath: "inset(-20% 0% -20% 0)", duration: 1.1, ease: "power1.inOut", clearProps: "clipPath" },
        );
        paths.forEach((path, index) => {
          const length = path.getTotalLength();
          timeline.fromTo(
            path,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: index ? 0.25 : 0.7, ease: "power1.inOut", clearProps: "strokeDasharray,strokeDashoffset" },
            index ? ">-0.05" : "-=0.35",
          );
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="ink"]').forEach((ink) => {
        gsap.fromTo(
          ink,
          { clipPath: "inset(-10% 100% -10% 0)" },
          {
            clipPath: "inset(-10% 0% -10% 0)",
            duration: 1.5,
            ease: "power1.inOut",
            clearProps: "clipPath",
            scrollTrigger: { trigger: ink, start: ENTER, once: true },
          },
        );
      });

      gsap.from(".credential-artwork", {
        autoAlpha: 0,
        scale: 0.97,
        duration: 1.4,
        ease: EASE,
        clearProps: "all",
        scrollTrigger: { trigger: ".credential-experience", start: "top 80%", once: true },
      });
    });

    // Layout shifts (fonts, media, opened rows) move every trigger.
    let pending = 0;
    const refresh = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const layout = new ResizeObserver(refresh);
    layout.observe(document.body);
    void document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      cancelAnimationFrame(pending);
      layout.disconnect();
      window.removeEventListener("load", refresh);
      context.revert();
      document.querySelectorAll(".is-masking").forEach((media) => media.classList.remove("is-masking"));
      gsap.ticker.remove(raf);
      lenis.destroy();
      root.classList.remove("motion-live");
    };
  }, []);

  return null;
}
