import { DepartureBoard } from "./departure-board";
import type { PortfolioEvent } from "@/data/portfolio";

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
          {entries.map((event) => (
            <details className="trip" key={event.id}>
              <summary>
                <DepartureBoard city={event.city} />
                <span className="trip-event">
                  <strong>{event.title}</strong>
                  <span className="trip-location">{event.country}</span>
                  <span>{event.date}</span>
                </span>
                <span className="trip-toggle" aria-hidden="true" />
              </summary>
              <div className="trip-detail">
                <div>
                  <p>{event.description}</p>
                  <nav aria-label={`${event.title} links`}>
                    <a href={event.href}>Event website</a>
                    {event.game && (
                      <>
                        <a href={event.game.href}>Play {event.game.title}</a>
                        <a href={event.game.repo}>Game source</a>
                      </>
                    )}
                  </nav>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
