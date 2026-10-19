"use client";

import { useEffect, useState } from "react";
import { LcdChip } from "./lcd-chip";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Local time where the work happens, read out on the LCD. */
export function LondonClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(format.format(new Date()));
    const first = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 15_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <LcdChip
      text={`LDN ${time ?? "--:--"}`}
      columns={9}
      dot={1.7}
      label={time ? `${time} in London` : "London time"}
      className="footer-clock"
    />
  );
}
