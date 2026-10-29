"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GlassGem from "./GlassGem";
import ReadySignal from "./ReadySignal";
import { gemstoneStudioSettings } from "./GemCardModel";
import type { Gemstone } from "@/data/gemstones";

export default function GemViewer({ gem, reducedMotion, loadAttempt = 0, onReady, onError }: {
  gem: Gemstone;
  reducedMotion: boolean;
  loadAttempt?: number;
  onReady: () => void;
  onError: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 6.8], fov: 36 }}
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      fallback={null}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-label={`Interactive 3D view of the ${gem.name}. Drag to rotate.`}
    >
      <Suspense fallback={null}>
        <group position={[0, 0.05, 0]}>
          <GlassGem
            model={gem.model}
            loadAttempt={loadAttempt}
            studioMaterial={gemstoneStudioSettings[gem.slug]}
            base={gem.palette.base}
            deep={gem.palette.deep}
            light={gem.palette.light}
            scale={1.15}
            spin={0}
            tilt={1.05}
          />
        </group>
        <OrbitControls
          enablePan={false}
          enableDamping={!reducedMotion}
          minDistance={4.8}
          maxDistance={9}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.6}
          rotateSpeed={0.55}
        />
        <ReadySignal onReady={onReady} onError={onError} />
      </Suspense>
    </Canvas>
  );
}
