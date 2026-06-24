"use client";

import { ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";

type HiddenAdminEntryProps = {
  children: ReactNode;
};

export function HiddenAdminEntry({ children }: HiddenAdminEntryProps) {
  const router = useRouter();
  const clickCount = useRef(0);
  const resetTimer = useRef<number | null>(null);
  const longPressTimer = useRef<number | null>(null);

  function goToAdmin() {
    router.push("/admin/login");
  }

  function handleClick() {
    clickCount.current += 1;

    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
    }

    resetTimer.current = window.setTimeout(() => {
      clickCount.current = 0;
    }, 1400);

    if (clickCount.current >= 5) {
      clickCount.current = 0;
      goToAdmin();
    }
  }

  function handleTouchStart() {
    longPressTimer.current = window.setTimeout(() => {
      goToAdmin();
    }, 5000);
  }

  function handleTouchEnd() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="select-none text-center"
      aria-label="Andre Burger"
    >
      {children}
    </button>
  );
}
