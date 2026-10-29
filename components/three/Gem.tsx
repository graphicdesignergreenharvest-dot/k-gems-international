"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { GemCut, GemFamily } from "@/data/gemstones";
import { createGemGeometry } from "./gemGeometry";

const IOR_BY_FAMILY: Record<GemFamily, number> = {
  Sapphire: 1.77,
  Ruby: 1.76,
  Emerald: 1.58,
  Spinel: 1.72,
};

export const iorForGem = (family: GemFamily) => IOR_BY_FAMILY[family];

type GemProps = {
  cut?: GemCut;
  base: string;
  deep: string;
  light: string;
  glow: string;
  scale?: number | [number, number, number];
  opacity?: number;
  spin?: number;
  segments?: number;
  roughness?: number;
  transmission?: number;
  ior?: number;
  dispersion?: number;
  attenuationDistance?: number;
  glowStrength?: number;
  flatShading?: boolean;
  materialRef?: RefObject<THREE.MeshPhysicalMaterial | null>;
  glowMaterialRef?: RefObject<THREE.SpriteMaterial | null>;
  tilt?: number;
};

function useGlowTexture() {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.28, "rgba(255,255,255,0.35)");
    gradient.addColorStop(0.68, "rgba(255,255,255,0.08)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    return canvasTexture;
  }, []);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  return texture;
}

export default function Gem({
  cut = "Oval",
  base,
  deep,
  light,
  glow,
  scale = 1,
  opacity = 1,
  spin = 0.22,
  segments = 32,
  roughness = 0.085,
  transmission = 0.18,
  ior = 1.77,
  dispersion = 0.5,
  attenuationDistance = 2.2,
  glowStrength = 0.18,
  flatShading = true,
  materialRef: externalMaterialRef,
  glowMaterialRef: externalGlowRef,
  tilt = 0.65,
}: GemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowTexture = useGlowTexture();
  const geometry = useMemo(
    () => createGemGeometry(cut, segments),
    [cut, segments],
  );
  const internalMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const internalGlowRef = useRef<THREE.SpriteMaterial>(null);
  const materialRef = externalMaterialRef ?? internalMaterialRef;
  const glowRef = externalGlowRef ?? internalGlowRef;

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = tilt;
    meshRef.current.rotation.y += delta * spin;
    meshRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.55 + meshRef.current.id) * 0.035;
    if (materialRef.current && !externalMaterialRef) {
      materialRef.current.opacity = opacity;
      materialRef.current.depthWrite = opacity > 0.6;
    }
    if (glowRef.current && !externalGlowRef) {
      glowRef.current.opacity = opacity * glowStrength;
    }
  });

  return (
    <group scale={scale}>
      {glowStrength > 0 && glowTexture && (
        <sprite scale={[3.4, 3.4, 1]} position={[0, 0, -0.45]}>
          <spriteMaterial
            ref={glowRef}
            map={glowTexture}
            color={glow}
            transparent
            opacity={opacity * glowStrength}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      )}
      <mesh ref={meshRef} geometry={geometry} renderOrder={2}>
        <meshPhysicalMaterial
          ref={materialRef}
          color={base}
          roughness={roughness}
          metalness={0}
          transmission={transmission}
          thickness={1.4}
          ior={ior}
          dispersion={dispersion}
          clearcoat={0.55}
          clearcoatRoughness={0.04}
          attenuationColor={deep}
          attenuationDistance={attenuationDistance}
          envMapIntensity={3.2}
          specularIntensity={1.25}
          specularColor={light}
          emissive={deep}
          emissiveIntensity={0}
          flatShading={flatShading}
          transparent
          opacity={opacity}
          side={THREE.FrontSide}
        />
      </mesh>
      {/* A faint inner core gives the stone density without hiding facets. */}
      <mesh scale={0.52} renderOrder={1}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial
          color={light}
          transparent
          opacity={opacity * 0.025}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
