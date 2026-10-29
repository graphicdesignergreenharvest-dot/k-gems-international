"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
let cached: number | null = null;

export default function CurrentYear({ fallback = 2026 }: { fallback?: number }) {
  const year = useSyncExternalStore(
    subscribe,
    () => {
      if (cached === null) cached = new Date().getFullYear();
      return cached;
    },
    () => fallback,
  );

  return <span suppressHydrationWarning>{year}</span>;
}
