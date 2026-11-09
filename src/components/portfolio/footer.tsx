import { DATA } from "@/data/resume";
import { LondonClock } from "./london-clock";

export function Footer() {
  return (
    <footer className="portfolio-footer">
      <div className="shell">
        <p>© 2026 {DATA.name}</p>
        <LondonClock />
      </div>
    </footer>
  );
}
