"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "@/config/theme";
import { MoonIcon, SunIcon } from "@/components/icons";

type Theme = "dark" | "light";

const listeners = new Set<() => void>();

function read(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function apply(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
    // Private windows may refuse storage; the switch still works for this visit.
  }
  listeners.forEach((l) => l());
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => apply(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`grid size-8 place-items-center rounded-full text-fg-60 transition-colors hover:bg-tint-2 hover:text-ink ${className}`}
    >
      {theme === "dark" ? <SunIcon className="size-[17px]" /> : <MoonIcon className="size-[17px]" />}
    </button>
  );
}
