"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import GlassGem from "./GlassGem";
import ReadySignal from "./ReadySignal";
import type { Gemstone } from "@/data/gemstones";

// The imported glass materials are fully transmissive and all have the same
// diamond-like IOR. These illustrative settings preserve each stone's palette
// while giving the existing geometry a more legible studio presentation.
export const gemstoneStudioSettings: Record<string, {
  tint: string;
  ior: number;
  fresnel: number;
}> = {
  "ceylon-blue-sapphire": { tint: "#4e85ff", ior: 1.77, fresnel: 0.22 },
  ruby: { tint: "#ff3650", ior: 1.76, fresnel: 0.18 },
  emerald: { tint: "#38d997", ior: 1.58, fresnel: 0.2 },
  "padparadscha-sapphire": { tint: "#ffb6a2", ior: 1.77, fresnel: 0.16 },
  "yellow-sapphire": { tint: "#ffdc60", ior: 1.77, fresnel: 0.14 },
  "rose-spinel": { tint: "#ff96b4", ior: 1.72, fresnel: 0.18 },
};

export default function GemCardModel({ gem, reducedMotion, onReady, onError }: {
  gem: Gemstone;
  reducedMotion: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 6.8], fov: 36 }}
      dpr={1}
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", stencil: false }}
      fallback={null}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-label={`${gem.name}, ${gem.colour.toLowerCase()}, ${gem.cut.toLowerCase()} cut`}
      role="img"
    >
      <Suspense fallback={null}>
        <group position={[0, 0.05, 0]}>
          <GlassGem
            model={gem.model}
            studioMaterial={gemstoneStudioSettings[gem.slug]}
            base={gem.palette.base}
            deep={gem.palette.deep}
            light={gem.palette.light}
            scale={1.15}
            spin={reducedMotion ? 0 : 0.18}
            tilt={1.05}
          />
        </group>
        <ReadySignal onReady={onReady} onError={onError} />
      </Suspense>
    </Canvas>
  );
}
