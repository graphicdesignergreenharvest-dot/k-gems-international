"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import ViewerBoundary from "@/components/three/ViewerBoundary";
import type { Gemstone } from "@/data/gemstones";
import {
  useReducedMotionPreference,
  useWebGLSupport,
} from "@/lib/useClientCapabilities";

const GemViewer = dynamic(() => import("@/components/three/GemViewer"), {
  ssr: false,
  loading: () => null,
});

export default function GemModelPreview({
  gem,
  className = "",
  allowRetry = true,
}: {
  gem: Gemstone;
  className?: string;
  allowRetry?: boolean;
}) {
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotionPreference();
  const ready = readyFor === gem.slug;

  const handleReady = useCallback(() => setReadyFor(gem.slug), [gem.slug]);
  const handleError = useCallback(() => {
    setFailed(true);
    setReadyFor(null);
  }, []);

  useEffect(() => {
    if (webgl !== true || failed || ready) return;
    const timeout = setTimeout(handleError, 30000);
    return () => clearTimeout(timeout);
  }, [webgl, failed, ready, handleError, attempt]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      role="group"
      aria-label={`Interactive 3D model of the ${gem.name}`}
    >
      {webgl === true && !failed && (
        <ViewerBoundary key={attempt} onError={handleError}>
          <GemViewer
            gem={gem}
            reducedMotion={reducedMotion}
            loadAttempt={attempt}
            onReady={handleReady}
            onError={handleError}
          />
        </ViewerBoundary>
      )}
      {!ready && (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#071525]/45 p-4 text-center"
          role="status"
        >
          <span className="border border-gold/20 bg-[#071525]/85 px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-ivory/70">
            {webgl === null
              ? "Checking 3D support…"
              : webgl === false || failed
                ? "3D model unavailable"
                : "Preparing 3D model…"}
          </span>
        </div>
      )}
      {allowRetry && failed && webgl === true && (
        <button
          type="button"
          onClick={() => {
            setAttempt((value) => value + 1);
            setFailed(false);
          }}
          className="absolute bottom-3 right-3 z-20 border border-gold/40 bg-[#071525]/90 px-3 py-2 text-[0.68rem] uppercase tracking-[0.16em] text-gold-soft hover:border-gold"
        >
          Retry 3D viewer
        </button>
      )}
    </div>
  );
}
