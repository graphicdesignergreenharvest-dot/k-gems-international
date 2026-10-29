import * as THREE from "three";
import type { GemCut } from "@/data/gemstones";

export type GemCutShape = GemCut;

type Vec2 = { x: number; z: number };

type Tier = { y: number; scale: number; offset: number };

function girdleRadius(angle: number, cut: GemCutShape): Vec2 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  switch (cut) {
    case "Round":
      return { x: cos, z: sin };
    case "Cushion": {
      const power = 2 / 3.2;
      return {
        x: Math.sign(cos) * Math.pow(Math.abs(cos), power),
        z: Math.sign(sin) * Math.pow(Math.abs(sin), power) * 0.94,
      };
    }
    case "Emerald": {
      // Chamfered rectangle: flatten the diagonals of the outline.
      const ax = Math.abs(cos);
      const az = Math.abs(sin);
      const norm = 1 / Math.max(ax, az, (ax + az) * 0.73);
      return { x: cos * norm, z: sin * norm * 0.8 };
    }
    case "Oval":
    default:
      return { x: cos, z: sin * 0.78 };
  }
}

function ring(
  count: number,
  y: number,
  scale: number,
  cut: GemCutShape,
  angleOffset = 0,
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + angleOffset;
    const r = girdleRadius(angle, cut);
    points.push(new THREE.Vector3(r.x * scale, y, r.z * scale));
  }
  return points;
}

function pushTriangle(
  positions: number[],
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
) {
  positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
}

function pushQuad(
  positions: number[],
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  d: THREE.Vector3,
) {
  pushTriangle(positions, a, b, c);
  pushTriangle(positions, a, c, d);
}

/**
 * Connects two rings of equal vertex count. The second ring may be rotated by
 * half a step, which produces the triangular upper-girdle and lower-girdle
 * facets of a brilliant cut rather than a uniform band of quads.
 */
function connectTiers(
  positions: number[],
  a: THREE.Vector3[],
  b: THREE.Vector3[],
  bShift = 0,
) {
  const count = a.length;
  for (let i = 0; i < count; i += 1) {
    const next = (i + 1) % count;
    pushQuad(
      positions,
      a[i],
      a[next],
      b[(next + bShift) % count],
      b[(i + bShift) % count],
    );
  }
}

/**
 * A ring rotated by half a step meets the next aligned ring one vertex later.
 * Shifting that lower ring avoids the bow-tied, self-overlapping facets that
 * otherwise produce jagged silhouettes.
 */
function ringShift(previous: Tier, next: Tier) {
  return previous.offset > next.offset ? 1 : 0;
}

/**
 * Faces a convex gem outwards. Working per triangle (rather than flipping the
 * whole mesh) keeps the table, crown, girdle and pavilion winding consistent
 * even where the ring offsets create zig-zag facets.
 */
function orientOutward(positions: number[], centerY: number) {
  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i];
    const ay = positions[i + 1];
    const az = positions[i + 2];
    const bx = positions[i + 3];
    const by = positions[i + 4];
    const bz = positions[i + 5];
    const cx = positions[i + 6];
    const cy = positions[i + 7];
    const cz = positions[i + 8];

    const abx = bx - ax;
    const aby = by - ay;
    const abz = bz - az;
    const acx = cx - ax;
    const acy = cy - ay;
    const acz = cz - az;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;

    const midX = (ax + bx + cx) / 3;
    const midY = (ay + by + cy) / 3 - centerY;
    const midZ = (az + bz + cz) / 3;

    if (nx * midX + ny * midY + nz * midZ < 0) {
      for (let component = 0; component < 3; component += 1) {
        const b = i + 3 + component;
        const c = i + 6 + component;
        const swap = positions[b];
        positions[b] = positions[c];
        positions[c] = swap;
      }
    }
  }
}

/**
 * Builds a faceted gemstone with a brilliant-style crown, a thin girdle and a
 * three-tier pavilion. Geometry is non-indexed so every facet keeps its own
 * crisp plane under flat shading.
 */
export function createGemGeometry(
  cut: GemCutShape = "Oval",
  segments = 32,
): THREE.BufferGeometry {
  const stepped = cut === "Emerald";
  const count = stepped
    ? 24
    : Math.min(48, Math.max(24, Math.round(segments / 8) * 8));

  const crownHeight = stepped ? 0.38 : 0.36;
  const pavilionDepth = stepped ? 1 : 0.98;
  const girdle = 0.03;
  const tableScale = stepped ? 0.55 : cut === "Round" ? 0.57 : 0.56;

  const positions: number[] = [];
  const girdleTop = ring(count, girdle / 2, 1, cut);
  const girdleBottom = ring(count, -girdle / 2, 1, cut);

  // Crown tiers. Brilliant cuts alternate their ring offsets so the upper
  // girdle facets resolve into triangles; step cuts stay aligned and flat.
  const crownTiers: Tier[] = stepped
    ? [
        { y: crownHeight * 0.38, scale: 0.9, offset: 0 },
        { y: crownHeight * 0.72, scale: 0.72, offset: 0 },
        { y: crownHeight, scale: tableScale, offset: 0 },
      ]
    : [
        { y: crownHeight * 0.45, scale: 0.9, offset: 0.5 },
        { y: crownHeight * 0.78, scale: 0.74, offset: 0 },
        { y: crownHeight, scale: tableScale, offset: 0 },
      ];

  const pavilionTiers: Tier[] = stepped
    ? [
        { y: -pavilionDepth * 0.38, scale: 0.82, offset: 0 },
        { y: -pavilionDepth * 0.72, scale: 0.5, offset: 0 },
      ]
    : [
        { y: -pavilionDepth * 0.36, scale: 0.78, offset: 0.5 },
        { y: -pavilionDepth * 0.7, scale: 0.46, offset: 0 },
      ];

  let previous = girdleTop;
  let previousTier: Tier = { y: girdle / 2, scale: 1, offset: 0 };
  for (const tier of crownTiers) {
    const current = ring(
      count,
      tier.y,
      tier.scale,
      cut,
      tier.offset * (Math.PI * 2) / count,
    );
    connectTiers(positions, previous, current, ringShift(previousTier, tier));
    previous = current;
    previousTier = tier;
  }

  // Flat table.
  const tableCenter = new THREE.Vector3(0, crownHeight, 0);
  for (let i = 0; i < count; i += 1) {
    const next = (i + 1) % count;
    pushTriangle(positions, tableCenter, previous[i], previous[next]);
  }

  // Girdle band.
  connectTiers(positions, girdleBottom, girdleTop);

  // Pavilion tiers and culet.
  previous = girdleBottom;
  previousTier = { y: -girdle / 2, scale: 1, offset: 0 };
  for (const tier of pavilionTiers) {
    const current = ring(
      count,
      tier.y,
      tier.scale,
      cut,
      tier.offset * (Math.PI * 2) / count,
    );
    connectTiers(positions, previous, current, ringShift(previousTier, tier));
    previous = current;
    previousTier = tier;
  }
  const culet = new THREE.Vector3(0, -pavilionDepth, 0);
  for (let i = 0; i < count; i += 1) {
    const next = (i + 1) % count;
    pushTriangle(positions, previous[i], previous[next], culet);
  }

  orientOutward(positions, (crownHeight - pavilionDepth) / 2);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.computeVertexNormals();
  geometry.translate(0, 0.24, 0);
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  return geometry;
}

/** Rough, naturally irregular crystal cluster used for the discovery scene. */
export function createRoughCrystalGeometry(seed = 7): THREE.BufferGeometry {
  const source = new THREE.IcosahedronGeometry(1, 1);
  const geometry = source.index ? source.toNonIndexed() : source;
  if (geometry !== source) source.dispose();

  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  let random = seed;
  const rand = () => {
    random = (random * 16807) % 2147483647;
    return (random - 1) / 2147483646;
  };

  const cache = new Map<string, number>();
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const key = `${x.toFixed(3)}:${y.toFixed(3)}:${z.toFixed(3)}`;
    let jitter = cache.get(key);
    if (jitter === undefined) {
      jitter = 0.82 + rand() * 0.36;
      cache.set(key, jitter);
    }
    position.setXYZ(i, x * jitter, y * jitter * 1.18, z * jitter);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/** Soft, hand-formed gold band ring with a gem seat. */
export function createRingGeometry() {
  const group = new THREE.Group();
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.075, 24, 96),
    new THREE.MeshStandardMaterial({
      color: "#d6b77d",
      metalness: 1,
      roughness: 0.16,
      envMapIntensity: 1.9,
    }),
  );
  band.rotation.x = Math.PI / 2;
  group.add(band);

  const setting = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.17, 0.12, 32, 1, true),
    new THREE.MeshStandardMaterial({
      color: "#e2c894",
      metalness: 1,
      roughness: 0.2,
      side: THREE.DoubleSide,
      envMapIntensity: 1.8,
    }),
  );
  setting.position.set(0, 0.46, 0);
  group.add(setting);
  return group;
}
