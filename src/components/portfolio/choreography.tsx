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
const ENTER = "top 88%";
const INTRO = ".hero-line-inner, .hero-intro, .tray-base, .tray-lip, .tray-navigation";

/**
 * Page-wide choreography over server-rendered markup.
 *
 * Rule that keeps it flicker-free: an element is only ever hidden while it is
 * still below the fold, and only revealed with `to` tweens. Anything already
 * on screen (or scrolled past) when this runs is left exactly as it is.
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

    const pending = (element: Element) =>
      element.getBoundingClientRect().top > innerHeight;
    let disposed = false;

    // The hero intro is CSS, running since first paint; this only marks its end.
    const intro = Array.from(document.querySelectorAll(INTRO)).flatMap((element) => element.getAnimations());
    void Promise.allSettled(intro.map((animation) => animation.finished)).then(() =>
      root.classList.add("intro-done"),
    );

    const context = gsap.context(() => {
      gsap.to(".optical-tray", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ".optical-hero", start: "top top", end: "bottom top", scrub: true },
      });

      const reveal = (selector: string) => gsap.utils.toArray<HTMLElement>(selector).filter(pending);

      const rises = reveal('[data-reveal="rise"], .trip');
      const show = (batch: Element[]) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: EASE,
          stagger: 0.07,
          overwrite: true,
          clearProps: "transform,opacity,visibility",
        });
      if (rises.length) {
        gsap.set(rises, { autoAlpha: 0, y: 26 });
        ScrollTrigger.batch(rises, {
          start: ENTER,
          once: true,
          onEnter: show,
          // A fast anchor jump can skip straight past the start.
          onLeave: show,
        });
      }

      // Media surfaces out of a feathered edge, then the mask is dropped.
      reveal('[data-reveal="media"]').forEach((media) => {
        const image = media.querySelector("img, video");
        media.classList.add("is-masking");
        gsap.set(media, { "--mask-y": "100%" });
        gsap
          .timeline({
            scrollTrigger: { trigger: media, start: "top 92%", once: true },
            onComplete: () => media.classList.remove("is-masking"),
          })
          .to(media, { "--mask-y": "0%", duration: 1.5, ease: SOFT })
          .fromTo(image, { scale: 1.07 }, { scale: 1, duration: 1.8, ease: EASE, clearProps: "transform" }, 0);
      });

      // Handwritten notes write themselves, then the arrow is drawn.
      reveal('[data-reveal="note"]').forEach((note) => {
        const text = note.querySelector("p");
        const paths = Array.from(note.querySelectorAll("path"));
        gsap.set(text, { clipPath: "inset(-20% 100% -20% 0)" });
        const lengths = paths.map((path) => path.getTotalLength());
        paths.forEach((path, index) =>
          gsap.set(path, { strokeDasharray: lengths[index], strokeDashoffset: lengths[index] }),
        );
        const timeline = gsap.timeline({ scrollTrigger: { trigger: note, start: ENTER, once: true } });
        timeline.to(text, { clipPath: "inset(-20% 0% -20% 0)", duration: 1.1, ease: "power1.inOut", clearProps: "clipPath" });
        paths.forEach((path, index) =>
          timeline.to(
            path,
            { strokeDashoffset: 0, duration: index ? 0.25 : 0.7, ease: "power1.inOut", clearProps: "strokeDasharray,strokeDashoffset" },
            index ? ">-0.05" : "-=0.35",
          ),
        );
      });

      reveal('[data-reveal="ink"]').forEach((ink) => {
        gsap.set(ink, { clipPath: "inset(-10% 100% -10% 0)" });
        gsap.to(ink, {
          clipPath: "inset(-10% 0% -10% 0)",
          duration: 1.5,
          ease: "power1.inOut",
          clearProps: "clipPath",
          scrollTrigger: { trigger: ink, start: ENTER, once: true },
        });
      });

      reveal(".credential-artwork").forEach((artwork) => {
        gsap.set(artwork, { autoAlpha: 0, scale: 0.97 });
        gsap.to(artwork, {
          autoAlpha: 1,
          scale: 1,
          duration: 1.4,
          ease: EASE,
          clearProps: "all",
          scrollTrigger: { trigger: artwork, start: "top 85%", once: true },
        });
      });
    });

    // Headings split by word once fonts are final, so a font swap can never
    // re-split (and replay) a heading. Word masks don't depend on line breaks,
    // so resizing never needs a re-split either.
    void document.fonts.ready.then(() => {
      if (disposed) return;
      context.add(() => {
        gsap.utils.toArray<HTMLElement>('[data-reveal="words"]').filter(pending).forEach((heading) => {
          const split = SplitText.create(heading, { type: "words", mask: "words" });
          gsap.set(split.masks, { paddingBottom: "0.14em", marginBottom: "-0.14em" });
          gsap.set(split.words, { yPercent: 115 });
          gsap.to(split.words, {
            yPercent: 0,
            duration: 1.05,
            ease: EASE,
            stagger: 0.05,
            scrollTrigger: { trigger: heading, start: ENTER, once: true },
          });
        });
      });
      ScrollTrigger.refresh();
    });

    // Only discrete layout changes move triggers: fonts, page load, opened rows.
    let timer = 0;
    const refresh = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 160);
    };
    window.addEventListener("load", refresh);
    document.addEventListener("toggle", refresh, true);

    return () => {
      disposed = true;
      clearTimeout(timer);
      window.removeEventListener("load", refresh);
      document.removeEventListener("toggle", refresh, true);
      context.revert();
      document.querySelectorAll(".is-masking").forEach((media) => media.classList.remove("is-masking"));
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
