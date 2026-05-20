"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type StickySearchSidebarProps = {
  children: ReactNode;
};

export function StickySearchSidebar({ children }: StickySearchSidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) {
      return;
    }

    const updateHeight = () => {
      const panel = sidebar.firstElementChild;
      const height =
        panel instanceof HTMLElement
          ? panel.getBoundingClientRect().height
          : sidebar.getBoundingClientRect().height;

      sidebar.style.setProperty("--search-panel-height", `${Math.ceil(height)}px`);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight);

      return () => window.removeEventListener("resize", updateHeight);
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(sidebar);

    if (sidebar.firstElementChild) {
      observer.observe(sidebar.firstElementChild);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <aside
      aria-label="検索条件"
      className="search-layout__sidebar"
      ref={sidebarRef}
    >
      {children}
    </aside>
  );
}
