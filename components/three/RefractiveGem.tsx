"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshRefractionMaterial } from "@react-three/drei";
import type { GemCut } from "@/data/gemstones";
import { createGemGeometry } from "./gemGeometry";
import { getStudioEnvTexture } from "./studioTexture";

type RefractiveGemProps = {
  cut?: GemCut;
  tint: string;
  scale?: number | [number, number, number];
  segments?: number;
  tilt?: number;
  spin?: number;
  ior?: number;
  bounces?: number;
  aberration?: number;
  fresnel?: number;
  meshRef?: RefObject<THREE.Mesh | null>;
  glossMaterialRef?: RefObject<THREE.MeshPhysicalMaterial | null>;
  opacity?: number;
  surfaceGloss?: boolean;
};

/**
 * A physically ray-traced gem for the large, inspectable renders. The material
 * traces refracted rays through the faceted mesh and samples a studio
 * environment, producing internal reflections and chromatic fire that a
 * surface-only material cannot.
 */
export default function RefractiveGem({
  cut = "Oval",
  tint,
  scale = 1,
  segments = 40,
  tilt = 0.35,
  spin = 0.06,
  ior = 1.77,
  bounces = 3,
  aberration = 0.05,
  fresnel = 0.7,
  meshRef: externalMeshRef,
  glossMaterialRef,
  opacity = 1,
  surfaceGloss = false,
}: RefractiveGemProps) {
  const internalMeshRef = useRef<THREE.Mesh>(null);
  const meshRef = externalMeshRef ?? internalMeshRef;
  const envMap = useMemo(() => getStudioEnvTexture(), []);
  const geometry = useMemo(
    () => createGemGeometry(cut, segments),
    [cut, segments],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.rotation.x = tilt;
    mesh.rotation.y += delta * spin;
    mesh.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={scale}
      renderOrder={2}
    >
      {envMap ? (
        <MeshRefractionMaterial
          envMap={envMap}
          bounces={bounces}
          ior={ior}
          fresnel={fresnel}
          aberrationStrength={aberration}
          fastChroma
          color={tint}
          opacity={opacity}
          transparent
          depthWrite={opacity > 0.95}
        />
      ) : (
        <meshPhysicalMaterial
          color={tint}
          roughness={0.08}
          transmission={0.2}
          thickness={1.4}
          ior={ior}
        />
      )}
      {surfaceGloss && (
        <mesh
          geometry={geometry}
          scale={1.004}
          renderOrder={3}
          raycast={() => null}
        >
          <meshPhysicalMaterial
            ref={glossMaterialRef}
            color="#000000"
            metalness={0}
            roughness={0.035}
            clearcoat={1}
            clearcoatRoughness={0.02}
            envMapIntensity={4}
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            flatShading
          />
        </mesh>
      )}
    </mesh>
  );
}
