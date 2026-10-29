"use client";

import { Suspense, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import GlassGem from "./GlassGem";
import RefractiveGem from "./RefractiveGem";
import ReadySignal from "./ReadySignal";
import StudioEnv from "./StudioEnv";
import { gemstones } from "@/data/gemstones";
import { featuredOrder, type HeroSharedState } from "@/lib/heroState";
import { seededRandom } from "@/lib/random";

const clamp01 = (value: number) => THREE.MathUtils.clamp(value, 0, 1);
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

type Vec3 = [number, number, number];

const emerge: Vec3[] = [
  [-4.55, -1.7, -2.3],
  [4.55, -1.8, -2.5],
  [-5.35, 1.9, -3.7],
  [5.35, 1.7, -3.9],
  [-2.4, 3.1, -4.7],
  [2.4, 3.0, -4.5],
];

const orbit: Vec3[] = [
  [-4.9, 0.5, 0.5],
  [-2.6, 2.4, -2.1],
  [1.4, 2.9, -3.3],
  [4.9, 1.4, -1.2],
  [4.1, -1.9, -0.7],
  [0.1, -2.9, -2.3],
];

const featuredLayout: Vec3[] = [
  [-5.1, -0.2, -5.5],
  [-3.1, -0.45, -5.8],
  [-1.0, -0.25, -6.1],
  [1.0, -0.4, -6.0],
  [3.1, -0.2, -5.7],
  [5.1, -0.45, -5.4],
];

const formationWide: Vec3[] = [
  [-6.1, 0.45, 0.8],
  [-3.65, -0.3, 0.1],
  [-1.2, 0.4, 0.9],
  [1.25, -0.3, 0.2],
  [3.7, 0.4, 0.9],
  [6.15, -0.25, 0.1],
];

const formationNarrow: Vec3[] = [
  [-3.15, 1.15, 0.4],
  [0, 1.15, 0.4],
  [3.15, 1.15, 0.4],
  [-3.15, -1.25, 0.4],
  [0, -1.25, 0.4],
  [3.15, -1.25, 0.4],
];

const showcaseOrbit: Vec3[] = [
  [-4.7, 1.65, -1.5],
  [-2.5, 2.45, -2.1],
  [0, 2.75, -2.8],
  [2.5, 2.25, -2.1],
  [4.65, 1.45, -1.2],
  [3.8, -1.85, -1.1],
];

const scaleVec = (v: Vec3, factor: number, index: number): Vec3 => [
  v[0] * factor,
  v[1] * (0.84 + (index % 2) * 0.07),
  v[2],
];

function useSmoothProgress(stateRef: RefObject<HeroSharedState>, speed = 5) {
  const smooth = useRef(0);
  useFrame((_, delta) => {
    smooth.current = THREE.MathUtils.damp(
      smooth.current,
      stateRef.current?.progress ?? 0,
      speed,
      delta,
    );
  });
  return smooth;
}

function GemCard({
  index,
  stateRef,
  narrow,
}: {
  index: number;
  stateRef: RefObject<HeroSharedState>;
  narrow: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const goldMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const faceMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const gemMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const gem = gemstones[index];
  const smooth = useSmoothProgress(stateRef, 5.5);
  const spread = narrow ? 0.62 : 1;
  const emergenceDelay = index * 0.012;

  useFrame((frame, delta) => {
    if (!group.current || !inner.current) return;
    const p = smooth.current;
    const time = frame.clock.elapsedTime;
    const float = Math.sin(time * 0.55 + index * 1.7) * 0.12;

    const position = new THREE.Vector3(
      emerge[index][0] * spread,
      -7.5,
      emerge[index][2],
    );
    let scale = 0.34;
    let opacity = 0;

    const tEmerge = smoothstep(
      0.015 + emergenceDelay,
      0.15 + emergenceDelay,
      p,
    );
    const tOrbit = smoothstep(0.3, 0.48, p);
    const tShowcase = smoothstep(0.33, 0.43, p) * (1 - smoothstep(0.52, 0.61, p));
    const tFeatured = smoothstep(0.57, 0.69, p);
    const tFormation = smoothstep(0.8, 0.94, p);

    const emergePos = scaleVec(emerge[index], spread, index);
    const orbitPos = scaleVec(orbit[index], spread, index);
    const featPos = featuredLayout[index];
    const formation = narrow ? formationNarrow : formationWide;
    const formationPos = scaleVec(formation[index], 1, index);

    position.lerp(
      new THREE.Vector3(emergePos[0], emergePos[1] + float, emergePos[2]),
      tEmerge,
    );
    position.lerp(
      new THREE.Vector3(orbitPos[0], orbitPos[1] + float * 1.4, orbitPos[2]),
      tOrbit,
    );
    const motionPosition = scaleVec(showcaseOrbit[index], spread, index);
    position.lerp(
      new THREE.Vector3(motionPosition[0], motionPosition[1] + float * 1.7, motionPosition[2]),
      tShowcase,
    );
    position.lerp(
      new THREE.Vector3(featPos[0], featPos[1] + float * 0.5, featPos[2]),
      tFeatured,
    );
    position.lerp(
      new THREE.Vector3(
        formationPos[0],
        formationPos[1] + float * 0.7,
        formationPos[2],
      ),
      tFormation,
    );

    scale = THREE.MathUtils.lerp(scale, 1, tEmerge);
    scale = THREE.MathUtils.lerp(scale, 1.03, tOrbit);
    scale = THREE.MathUtils.lerp(scale, narrow ? 0.88 : 0.96, tShowcase);
    scale = THREE.MathUtils.lerp(scale, narrow ? 0.66 : 0.6, tFeatured);
    scale = THREE.MathUtils.lerp(scale, narrow ? 0.72 : 0.79, tFormation);

    opacity = tEmerge;
    opacity = THREE.MathUtils.lerp(opacity, 1, tShowcase);
    opacity = THREE.MathUtils.lerp(opacity, 0.26, tFeatured);
    opacity = THREE.MathUtils.lerp(opacity, 1, tFormation);

    group.current.position.lerp(position, 0.32);
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, scale, 7, delta),
    );

    const sway = Math.sin(time * 0.4 + index * 1.9) * 0.06;
    const targetYaw =
      (index % 2 === 0 ? 1 : -1) * 0.16 * tOrbit +
      (index % 2 === 0 ? 1 : -1) * (0.08 + 0.035 * Math.sin(time * 0.3 + index)) * tShowcase +
      (index % 2 === 0 ? 0.06 : -0.06) * tFormation +
      sway;
    const targetPitch = Math.cos(time * 0.33 + index) * 0.035;
    const targetRoll = (index - 2.5) * 0.018 + sway * 0.25;

    inner.current.rotation.y = THREE.MathUtils.damp(
      inner.current.rotation.y,
      targetYaw,
      3.2,
      delta,
    );
    inner.current.rotation.x = THREE.MathUtils.damp(
      inner.current.rotation.x,
      targetPitch,
      3,
      delta,
    );
    inner.current.rotation.z = THREE.MathUtils.damp(
      inner.current.rotation.z,
      targetRoll,
      3,
      delta,
    );

    if (labelRef.current) {
      const labelVisibility =
        p < 0.28
          ? clamp01(tEmerge * 1.25) * (1 - smoothstep(0.25, 0.32, p))
          : smoothstep(0.82, 0.94, p);
      labelRef.current.style.opacity = String(labelVisibility);
    }
    if (goldMaterial.current) {
      goldMaterial.current.opacity = opacity;
      goldMaterial.current.depthWrite = opacity > 0.75;
    }
    if (faceMaterial.current) {
      faceMaterial.current.opacity = Math.min(1, opacity * 1.25);
      faceMaterial.current.depthWrite = opacity > 0.75;
    }
    if (gemMaterial.current) {
      gemMaterial.current.opacity = opacity;
      gemMaterial.current.depthWrite = opacity > 0.7;
      gemMaterial.current.transparent = opacity < 0.99;
    }
  });

  return (
    <group ref={group} position={[0, -7.5, 0]} visible>
      <group ref={inner}>
        <RoundedBox
          args={[3.14, 4.2, 0.16]}
          radius={0.075}
          smoothness={2}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            ref={goldMaterial}
            color="#b8955c"
            metalness={0.92}
            roughness={0.33}
            envMapIntensity={0.9}
            transparent
          />
        </RoundedBox>
        <RoundedBox
          args={[3.02, 4.08, 0.17]}
          radius={0.05}
          smoothness={2}
          position={[0, 0, 0.035]}
        >
          <meshStandardMaterial
            ref={faceMaterial}
            color="#091524"
            metalness={0.35}
            roughness={0.5}
            envMapIntensity={0.55}
            transparent
          />
        </RoundedBox>
        <mesh position={[0, 0.38, 0.128]}>
          <planeGeometry args={[2.55, 2.7]} />
          <meshBasicMaterial color="#050b13" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, -1.62, 0.13]}>
          <planeGeometry args={[2.2, 0.008]} />
          <meshBasicMaterial color="#c9a96e" transparent opacity={0.55} />
        </mesh>
        <GlassGem
          model={gem.model}
          base={gem.palette.base}
          deep={gem.palette.deep}
          light={gem.palette.light}
          scale={1.24}
          spin={index % 2 === 0 ? 0.2 : -0.17}
          materialRef={gemMaterial}
        />
        <Html
          transform
          position={[0, -1.34, 0.12]}
          center
          distanceFactor={7.4}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            ref={labelRef}
            style={{
              width: "220px",
              textAlign: "center",
              opacity: 0,
              transition: "opacity 0.4s linear",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                lineHeight: 1.2,
                color: "#f7f6f2",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {gem.name}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: "var(--font-body)",
                fontSize: "9px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(201,169,110,0.9)",
                whiteSpace: "nowrap",
              }}
            >
              {gem.colour} · {gem.cut} cut
            </p>
          </div>
        </Html>
        <mesh position={[0, 0.38, 0.14]}>
          <circleGeometry args={[1.26, 48]} />
          <meshBasicMaterial
            color={gem.palette.glow}
            transparent
            opacity={0.025}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function SoloGem({
  stateRef,
  narrow,
  selectionReady,
}: {
  stateRef: RefObject<HeroSharedState>;
  narrow: boolean;
  selectionReady: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glossRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const smooth = useSmoothProgress(stateRef, 4.5);

  const tint = useRef(new THREE.Color(gemstones[0].palette.glow));
  // On phones the copy fills the centre of the screen, so the idle gem sits low
  // beneath it instead of covering the headline.
  const idleY = narrow ? -5.4 : 0.1;

  useFrame((frame, delta) => {
    if (!group.current) return;
    const p = smooth.current;
    const state = stateRef.current;
    const featured =
      gemstones[featuredOrder[state?.featured ?? 0]] ?? gemstones[0];
    tint.current.lerp(new THREE.Color(featured.palette.glow), 0.05);

    const enter = 1 - smoothstep(0.22, 0.36, p);
    const featuredIn = smoothstep(0.55, 0.64, p);
    const featuredOut = 1 - smoothstep(0.82, 0.92, p);
    const featuredVisibility = featuredIn * featuredOut;
    const visibility = Math.max(enter, featuredVisibility);

    // Hide the solo hero gem when cards are visible (progress > 0.5)
    const hideHero = selectionReady && p > 0.45 && p < 0.75;
    group.current.visible = !hideHero && visibility > 0.02;

    const centerX = narrow ? 0 : 1.15;
    const targetX = THREE.MathUtils.lerp(centerX, narrow ? 0 : -3.05, featuredIn);
    const targetY =
      THREE.MathUtils.lerp(idleY, 0.15, featuredIn) + Math.sin(frame.clock.elapsedTime * 0.4) * 0.06;
    const targetZ = THREE.MathUtils.lerp(1.1, 2.3, featuredIn) - p * 0.4;
    const targetScale = THREE.MathUtils.lerp(
      narrow ? 1.05 : 1.75,
      narrow ? 1.25 : 1.55,
      featuredIn,
    );

    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      targetX,
      3.2,
      delta,
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      targetY,
      3.2,
      delta,
    );
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      targetZ,
      3,
      delta,
    );
    const target = targetScale * (0.9 + 0.1 * visibility);
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, target, 4, delta),
    );

    const material = meshRef.current?.material as
      | (THREE.ShaderMaterial & { color: THREE.Color; opacity: number })
      | undefined;
    if (material) {
      material.color.copy(tint.current);
      material.opacity = visibility;
    }
    if (glossRef.current) {
      glossRef.current.opacity = visibility * 0.32;
    }
  });

  return (
    <group ref={group} position={[narrow ? 0 : 1.15, idleY, 1.1]}>
      <RefractiveGem
        cut="Oval"
        tint={gemstones[0].palette.glow}
        scale={1}
        spin={0.16}
        segments={narrow ? 32 : 48}
        ior={1.77}
        bounces={2}
        aberration={0.03}
        fresnel={0.9}
        tilt={0.4}
        meshRef={meshRef}
        surfaceGloss={!narrow}
        glossMaterialRef={glossRef}
      />
      <pointLight
        position={[0, 0.4, 1.6]}
        intensity={3.2}
        distance={5}
        decay={2}
        color={gemstones[0].palette.glow}
      />
    </group>
  );
}

function DriftingParticles({ narrow }: { narrow: boolean }) {
  const points = useRef<THREE.Points>(null);
  const count = narrow ? 80 : 150;
  const positions = useMemo(() => {
    const rand = seededRandom(47);
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (rand() - 0.5) * 26;
      array[i * 3 + 1] = (rand() - 0.5) * 16;
      array[i * 3 + 2] = (rand() - 0.5) * 12 - 4;
    }
    return array;
  }, [count]);

  useFrame((frame) => {
    if (!points.current) return;
    points.current.rotation.y = frame.clock.elapsedTime * 0.01;
    points.current.position.y =
      Math.sin(frame.clock.elapsedTime * 0.1) * 0.2;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#d9c39a"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CameraRig({
  stateRef,
  narrow,
}: {
  stateRef: RefObject<HeroSharedState>;
  narrow: boolean;
}) {
  const smooth = useSmoothProgress(stateRef, 4);
  useFrame(({ camera }, delta) => {
    const p = smooth.current;
    const baseZ = narrow ? 18.4 : 13.6;
    const targetZ =
      baseZ +
      smoothstep(0.3, 0.6, p) * (narrow ? 2 : 1.6) +
      smoothstep(0.8, 1, p) * (narrow ? 1.8 : 2.4);
    const targetX = (stateRef.current?.pointerX ?? 0) * (narrow ? 0.12 : 0.35);
    const targetY = (stateRef.current?.pointerY ?? 0) * -0.2;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.4, delta);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function MotionOrbit({ stateRef, narrow }: { stateRef: RefObject<HeroSharedState>; narrow: boolean }) {
  const first = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  const smooth = useSmoothProgress(stateRef, 5);
  useFrame((frame, delta) => {
    const p = smooth.current;
    const visible = smoothstep(0.36, 0.48, p) * (1 - smoothstep(0.55, 0.67, p));
    const alpha = visible * 0.46;
    if (first.current) {
      first.current.rotation.z += delta * 0.035;
      first.current.rotation.x = THREE.MathUtils.damp(first.current.rotation.x, 0.34 + Math.sin(frame.clock.elapsedTime * 0.16) * 0.035, 1.4, delta);
      first.current.scale.setScalar(narrow ? 1.18 : 1.5);
      first.current.visible = alpha > 0.01;
      first.current.traverse((object) => { if ((object as THREE.Mesh).material && !Array.isArray((object as THREE.Mesh).material)) ((object as THREE.Mesh).material as THREE.Material & { opacity?: number }).opacity = alpha; });
    }
    if (second.current) {
      second.current.rotation.z -= delta * 0.022;
      second.current.rotation.x = THREE.MathUtils.damp(second.current.rotation.x, -0.48, 1.4, delta);
      second.current.scale.setScalar(narrow ? 0.94 : 1.2);
      second.current.visible = alpha > 0.01;
      second.current.traverse((object) => { if ((object as THREE.Mesh).material && !Array.isArray((object as THREE.Mesh).material)) ((object as THREE.Mesh).material as THREE.Material & { opacity?: number }).opacity = alpha * 0.55; });
    }
  });
  return (
    <group position={[0, 0.25, -0.8]}>
      <group ref={first} visible={false}>
        <mesh>
          <torusGeometry args={[3.05, 0.006, 6, 160]} />
          <meshBasicMaterial color="#c9a96e" transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <group ref={second} visible={false}>
        <mesh>
          <torusGeometry args={[3.5, 0.004, 6, 160]} />
          <meshBasicMaterial color="#dce5f2" transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function SceneContent({
  stateRef,
  cardsReady,
  selectionReady,
}: {
  stateRef: RefObject<HeroSharedState>;
  cardsReady: boolean;
  selectionReady: boolean;
}) {
  const { size } = useThree();
  const narrow = size.width < 820;
  const cards = useMemo(() => gemstones.slice(0, 6), []);

  return (
    <>
      <StudioEnv />
      <spotLight
        position={[4.5, 5.5, 8]}
        angle={0.5}
        penumbra={0.92}
        intensity={145}
        color="#fff7ea"
        distance={30}
        decay={1.5}
      />
      <pointLight
        position={[-5, 1.5, 5]}
        intensity={18}
        color="#9bbcff"
        distance={16}
        decay={1.8}
      />
      <pointLight
        position={[2.5, 2, -5]}
        intensity={26}
        color="#ffd9a3"
        distance={18}
        decay={1.8}
      />
      <MotionOrbit stateRef={stateRef} narrow={narrow} />
      <DriftingParticles narrow={narrow} />
      <SoloGem stateRef={stateRef} narrow={narrow} selectionReady={selectionReady} />
      {cardsReady && cards.map((_, index) => (
        <GemCard
          key={index}
          index={index}
          stateRef={stateRef}
          narrow={narrow}
        />
      ))}
      <CameraRig stateRef={stateRef} narrow={narrow} />
    </>
  );
}

export default function HeroScene({
  stateRef,
  cardsReady = false,
  selectionReady = false,
  onReady,
}: {
  stateRef: RefObject<HeroSharedState>;
  cardsReady?: boolean;
  selectionReady?: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 13.6], fov: 42, near: 0.1, far: 80 }}
      dpr={[1, 1.85]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: process.env.NODE_ENV !== "production",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <SceneContent stateRef={stateRef} cardsReady={cardsReady} selectionReady={selectionReady} />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
