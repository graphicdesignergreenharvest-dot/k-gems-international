"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshRefractionMaterial, useGLTF } from "@react-three/drei";
import { getStudioEnvTexture } from "./studioTexture";

type GlassGemProps = {
  /** Basename of the GLB in /public/gem-vault-all, e.g. "ruby". */
  model: string;
  base: string;
  deep: string;
  light: string;
  scale?: number;
  spin?: number;
  tilt?: number;
  materialRef?: RefObject<THREE.MeshPhysicalMaterial | null>;
  studioMaterial?: { tint: string; ior: number; fresnel: number };
  loadAttempt?: number;
};

// Each audited collection GLB is a single mesh. Use its original geometry for
// the existing refraction shader, and release the shader's BVH textures on unmount.
function StudioRefraction({ geometry, settings }: {
  geometry: THREE.BufferGeometry;
  settings: NonNullable<GlassGemProps["studioMaterial"]>;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const envMap = useMemo(() => getStudioEnvTexture(true), []);

  useEffect(() => {
    const material = mesh.current?.material as THREE.ShaderMaterial | undefined;
    return () => {
      material?.uniforms.bvh?.value?.dispose();
      material?.dispose();
    };
  }, []);

  if (!envMap) throw new Error("The gemstone studio texture could not be created.");
  return (
    <mesh ref={mesh} geometry={geometry} dispose={null}>
      <MeshRefractionMaterial envMap={envMap} color={settings.tint} bounces={3} ior={settings.ior} fresnel={settings.fresnel} aberrationStrength={0} />
    </mesh>
  );
}

/** Glass gem from the GLB library, tinted to the gemstone's palette. */
export default function GlassGem({
  model,
  base,
  deep,
  light,
  scale = 1,
  spin = 0.22,
  tilt = 0.65,
  materialRef,
  studioMaterial,
  loadAttempt = 0,
}: GlassGemProps) {
  const { scene } = useGLTF(`/gem-vault-all/${model}-glass.glb${loadAttempt ? `?retry=${loadAttempt}` : ""}`);
  const groupRef = useRef<THREE.Group>(null);

  // Clone so each gem has its own material and can be tinted independently.
  const copyModel = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = (child.material as THREE.MeshPhysicalMaterial).clone();
        // Base colour of the gem
        mat.color = new THREE.Color(base);
        // Deep attenuation colour for realistic light absorption
        mat.attenuationColor = new THREE.Color(deep).lerp(new THREE.Color(base), 0.5);
        // Specular highlight colour
        mat.specularColor = new THREE.Color(light);
        // Ensure the material is treated as opaque with subtle transparency for refraction
        mat.transparent = true;
        // Improve visibility: low metalness, low roughness, stronger env map
        mat.metalness = 0;
        mat.roughness = 0.12;
        mat.envMapIntensity = 2.5;
        // Add thickness and attenuation distance for better colour depth
        mat.thickness = 0.5;
        mat.attenuationDistance = 1.6;
        // Force update after property changes
        mat.needsUpdate = true;
        child.material = mat;
      }
    });
    return copy;
  }, [scene, base, deep, light]);

  const studioGeometry = useMemo(() => {
    if (!studioMaterial) return null;
    const mesh = copyModel.children[0];
    return mesh instanceof THREE.Mesh ? mesh.geometry : null;
  }, [copyModel, studioMaterial]);

  useEffect(() => {
    let found: THREE.MeshPhysicalMaterial | null = null;
    copyModel.traverse((child) => {
      if (!found && child instanceof THREE.Mesh) {
        found = child.material as THREE.MeshPhysicalMaterial;
      }
    });
    if (materialRef) materialRef.current = found;
    return () => {
      copyModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.Material).dispose();
        }
      });
      if (materialRef) materialRef.current = null;
    };
  }, [copyModel, materialRef]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.x = tilt;
    group.rotation.y += Math.min(delta, 0.05) * spin;
    group.position.y = spin === 0 ? 0 :
      Math.sin(state.clock.elapsedTime * 0.55 + group.id) * 0.035;
  });

  return (
    <group scale={scale}>
      <group ref={groupRef}>
        {studioGeometry && studioMaterial ? (
          <StudioRefraction geometry={studioGeometry} settings={studioMaterial} />
        ) : (
          <primitive object={copyModel} />
        )}
      </group>
    </group>
  );
}
