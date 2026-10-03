import type { PortfolioEvent } from "@/data/portfolio";
import { ArrowRight } from "lucide-react";
import { EventArtwork } from "./event-artwork";
import { CloudDivider } from "./cloud-divider";

export function Events({ entries }: { entries: PortfolioEvent[] }) {
  return (
    <section
      id="hackathons"
      className="events-section section-width"
      aria-labelledby="events-heading"
    >
      <h2 id="events-heading">Out in the world.</h2>
      {entries.length === 0 ? (
        <p>More events to come.</p>
      ) : (
        <div className="departure-ledger">
          {entries.map((event, index) => (
            <details
              className="trip"
              data-city={event.city}
              name="portfolio-events"
              suppressHydrationWarning
              key={event.id}
              open={
                event.id === "shiba" || (entries.length === 1 && index === 0)
              }
            >
              <summary>
                <span className="trip-city-label">{event.city}</span>
                <span>
                  {event.title} / {event.date}
                </span>
                <span className="trip-toggle" aria-hidden="true" />
                <CloudDivider />
              </summary>
              <div className="trip-detail">
                <EventArtwork
                  city={event.city}
                  title={event.game?.title ?? event.title}
                />
                <div className="trip-meta">
                  <span>{event.title}</span>
                  <span>{event.date}</span>
                </div>
                <p>{event.description}</p>
                <nav aria-label={`${event.title} links`}>
                  {event.game && (
                    <a href={event.game.href}>
                      Play {event.game.title}
                      <ArrowRight size={16} />
                    </a>
                  )}
                  <a href={event.href}>
                    Event website
                    <ArrowRight size={16} />
                  </a>
                  {event.game && (
                    <a className="trip-source" href={event.game.repo}>
                      Game source
                      <ArrowRight size={16} />
                    </a>
                  )}
                </nav>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
