"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * Signals readiness after the scene has actually rendered its first frame.
 * Creating the renderer is not enough: shader compilation can leave the canvas
 * black for a moment, so the 2D fallback should stay visible until then.
 */
export default function ReadySignal({ onReady, onError }: { onReady?: () => void; onError?: () => void }) {
  const done = useRef(false);
  const readyFrame = useRef<number | null>(null);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
    return () => {
      if (readyFrame.current !== null) cancelAnimationFrame(readyFrame.current);
      readyFrame.current = null;
      done.current = false;
    };
  }, [invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    const onContextLost = () => onError?.();
    canvas.addEventListener("webglcontextlost", onContextLost);
    return () => canvas.removeEventListener("webglcontextlost", onContextLost);
  }, [gl, onError]);

  useFrame(() => {
    if (done.current || readyFrame.current !== null) return;
    // Mark completion only after notification; Strict Mode may cancel this RAF.
    readyFrame.current = requestAnimationFrame(() => {
      readyFrame.current = null;
      done.current = true;
      onReady?.();
    });
  });

  return null;
}
