"use client";

import { useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";

export function DepartureBoard({ city }: { city: string }) {
  const board = useRef<HTMLSpanElement>(null);
  const visible = useInView(board, { once: true, amount: 0.7 });

  return (
    <span className="trip-city" ref={board}>
      <span className="sr-only">{city}</span>
      <span className="trip-board" aria-hidden="true" data-visible={visible}>
        {city.toUpperCase().split(" ").map((word, wordIndex) => (
          <span className="trip-word" key={wordIndex}>
            {[...word].map((letter, letterIndex) => (
              <span
                className="trip-letter"
                key={letterIndex}
                style={{ "--flap-delay": `${letterIndex * 25}ms` } as CSSProperties}
              >
                <span className="letter-top"><span>{letter}</span></span>
                <span className="letter-bottom"><span>{letter}</span></span>
                <span className="flap-leaf"><span>{letter}</span></span>
                <span className="flap-reveal"><span>{letter}</span></span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}
