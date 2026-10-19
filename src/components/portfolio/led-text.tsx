import type { CSSProperties } from "react";
import { GLYPH_HEIGHT, GLYPH_WIDTH, dotMatrix } from "./dot-matrix-font";

/**
 * A fixed-width LED panel. Every dot position is always rendered so a label
 * change can sweep across the panel column by column instead of re-mounting.
 */
export function LedText({
  text,
  capacity,
  className,
}: {
  text: string;
  capacity: number;
  className?: string;
}) {
  const columns = capacity * (GLYPH_WIDTH + 1) - 1;
  const { dots, columns: used } = dotMatrix(text);
  const offset = Math.floor((columns - used) / 2);
  const lit = new Set(dots.map(([x, y]) => (x + offset) * GLYPH_HEIGHT + y));

  return (
    <svg
      className={className}
      viewBox={`0 0 ${columns * 3} ${GLYPH_HEIGHT * 3}`}
      aria-hidden="true"
    >
      {Array.from({ length: columns * GLYPH_HEIGHT }, (_, index) => {
        const x = Math.floor(index / GLYPH_HEIGHT);
        const y = index % GLYPH_HEIGHT;
        return (
          <circle
            key={index}
            cx={x * 3 + 1.5}
            cy={y * 3 + 1.5}
            r={1.05}
            data-lit={lit.has(index) || undefined}
            style={{ "--column": x } as CSSProperties}
          />
        );
      })}
    </svg>
  );
}
