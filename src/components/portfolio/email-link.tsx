"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The address copies itself: no extra control, just the line above confirming it.
 * Falls back to opening the mail app where the clipboard isn't available.
 */
export function EmailLink({ email, href, prompt }: { email: string; href: string; prompt: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = href;
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    <>
      <p className="finale-prompt" data-copied={copied}>
        <span>{prompt}</span>
        <span aria-live="polite">{copied ? "Copied. Talk soon." : ""}</span>
      </p>
      <button type="button" className="finale-email" onClick={copy} aria-label={`Copy ${email}`}>
        {email}
      </button>
    </>
  );
}
