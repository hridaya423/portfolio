import type { PortfolioEvent } from "@/data/portfolio";
import { ArrowRight } from "lucide-react";
import { EventArtwork } from "./event-artwork";
import { CloudDivider } from "./cloud-divider";
import { SectionHead } from "./sections";

export function Events({ entries }: { entries: PortfolioEvent[] }) {
  return (
    <section
      id="hackathons"
      className="section events-section"
      aria-labelledby="events-heading"
      data-section-label="EVENTS"
    >
      <div className="shell">
        <SectionHead id="events-heading">
          Out in the world.
        </SectionHead>
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
                open={index === 0}
              >
                <summary>
                  <span className="trip-city-label">
                    {event.label ?? event.city}
                  </span>
                  <span>
                    {event.label !== event.title && <>{event.title} / </>}
                    {event.award && <>{event.award} / </>}
                    {event.date}
                  </span>
                  <span className="trip-toggle" aria-hidden="true" />
                  <CloudDivider />
                </summary>
                <div className="trip-detail">
                  <EventArtwork
                    text={event.cloud ?? event.city}
                    initiallyOpen={index === 0}
                    title={
                      event.game?.title ?? event.project?.title ?? event.title
                    }
                  />
                  <div className="trip-meta">
                    <span>{event.title}</span>
                    <span>{event.date}</span>
                    {event.award && (
                      <span className="trip-award">{event.award}</span>
                    )}
                  </div>
                  <p>{event.description}</p>
                  <nav aria-label={`${event.title} links`}>
                    {event.game && (
                      <a href={event.game.href}>
                        Play {event.game.title}
                        <ArrowRight size={16} />
                      </a>
                    )}
                    {event.project && (
                      <a href={event.project.repo}>
                        {event.project.title} source
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
      </div>
    </section>
  );
}
