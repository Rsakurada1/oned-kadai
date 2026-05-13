"use client";

import { useEffect } from "react";

type SearchStatusAnnouncerProps = {
  focusTargetId?: string;
  message: string;
};

/**
 * 検索結果の更新をスクリーンリーダーへ通知し、結果見出しへ自然にフォーカスを移す。
 */
export function SearchStatusAnnouncer({
  focusTargetId,
  message,
}: SearchStatusAnnouncerProps) {
  useEffect(() => {
    if (!focusTargetId) {
      return;
    }

    // message も依存に含め、同じ見出しでも検索条件が変わるたびに通知とフォーカスを更新する。
    const target = document.getElementById(focusTargetId);
    target?.focus({ preventScroll: true });
  }, [focusTargetId, message]);

  return (
    <p aria-live="polite" className="sr-only" role="status">
      {message}
    </p>
  );
}
