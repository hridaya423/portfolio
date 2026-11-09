import type { ReactNode } from "react";

export function SectionHead({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <header className="section-head">
      <h2 id={id} className="section-title" data-reveal="words">
        {children}
      </h2>
    </header>
  );
}
