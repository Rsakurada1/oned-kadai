"use client";

import { useEffect } from "react";

type SearchStatusAnnouncerProps = {
  focusTargetId?: string;
  message: string;
};

export function SearchStatusAnnouncer({
  focusTargetId,
  message,
}: SearchStatusAnnouncerProps) {
  useEffect(() => {
    if (!focusTargetId) {
      return;
    }

    const target = document.getElementById(focusTargetId);
    target?.focus({ preventScroll: true });
  }, [focusTargetId, message]);

  return (
    <p aria-live="polite" className="sr-only" role="status">
      {message}
    </p>
  );
}

