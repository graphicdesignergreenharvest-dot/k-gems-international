"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const subscribe = () => () => {};

let webglCache: boolean | null = null;

function detectWebGL() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    // Current Three.js WebGLRenderer requires WebGL 2.
    const context = canvas.getContext("webgl2");
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Returns null during server rendering, then a stable capability result. */
export function useWebGLSupport() {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (webglCache === null) webglCache = detectWebGL();
      return webglCache;
    },
    () => null,
  );
}

export function useReducedMotionPreference() {
  return useReducedMotion() ?? false;
}
