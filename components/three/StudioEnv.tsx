"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * A local, file-free studio environment. Large softboxes, strip lights and a
 * cool rim are rendered into a cube map once, giving the gemstones bright
 * facet highlights, deep contrast and believable refraction.
 */
export default function StudioEnv({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#03060b"]} />

        {/* Key softbox, upper left */}
        <Lightformer
          form="rect"
          intensity={6.5}
          color="#fff8ec"
          scale={[11, 6, 1]}
          position={[-7, 6, 5]}
          rotation={[0, 0.38, 0]}
        />

        {/* Tall strip light, right — long facet highlights */}
        <Lightformer
          form="rect"
          intensity={4.5}
          color="#d9e8ff"
          scale={[2.6, 10, 1]}
          position={[8, 2, 3]}
          rotation={[0, -Math.PI / 2.4, 0]}
        />

        {/* Overhead ring — table sparkle */}
        <Lightformer
          form="ring"
          intensity={3.2}
          color="#ffffff"
          scale={4}
          position={[2, 8, -4]}
          rotation={[-Math.PI / 3, 0, 0]}
        />

        {/* Cool rim from behind */}
        <Lightformer
          form="circle"
          intensity={2.8}
          color="#4d84ea"
          scale={5}
          position={[-6, 1, -7]}
        />

        {/* Warm bounce from below */}
        <Lightformer
          form="rect"
          intensity={2}
          color="#f0d3a0"
          scale={[7, 2, 1]}
          position={[1, -5, 4]}
          rotation={[Math.PI / 2, 0, 0]}
        />

        {/* Narrow front strip — crisp edge glints */}
        <Lightformer
          form="rect"
          intensity={3.4}
          color="#ffffff"
          scale={[0.9, 7, 1]}
          position={[0.5, 1.5, 9]}
        />
      </Environment>

      <ambientLight intensity={0.1 * intensity} color="#b8c8e0" />
      <directionalLight
        position={[-4, 7, 5]}
        intensity={0.9 * intensity}
        color="#fff4e2"
      />
      <directionalLight
        position={[5, 2, -6]}
        intensity={0.55 * intensity}
        color="#9bb8ff"
      />
    </>
  );
}
