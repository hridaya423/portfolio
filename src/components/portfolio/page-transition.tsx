"use client";

import { ViewTransition, useLayoutEffect, useRef, type ReactNode } from "react";
import type {} from "react/canary";
import { usePathname } from "next/navigation";
import "./page-transition.css";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const landing = useRef(pathname);

  useLayoutEffect(() => {
    if (pathname !== landing.current || !document.querySelector(".optical-hero"))
      document.documentElement.classList.add("intro-done");
  }, [pathname]);

  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
