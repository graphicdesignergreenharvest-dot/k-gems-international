import * as THREE from "three";

let cached: THREE.CanvasTexture | null = null;
let neutralCached: THREE.CanvasTexture | null = null;

/**
 * A softbox studio painted into an equirectangular texture. The refraction
 * material samples this directly, so the gem gets internal reflections and
 * chromatic fire without depending on the page background behind the canvas.
 */
export function getStudioEnvTexture(neutral = false) {
  if (neutral && neutralCached) return neutralCached;
  if (!neutral && cached) return cached;
  if (typeof document === "undefined") return null;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "#5d7ca8");
  background.addColorStop(0.42, "#2b4365");
  background.addColorStop(1, "#0d1728");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const horizon = ctx.createRadialGradient(
    width * 0.52,
    height * 0.46,
    0,
    width * 0.52,
    height * 0.46,
    width * 0.42,
  );
  horizon.addColorStop(0, "rgba(158,196,246,0.78)");
  horizon.addColorStop(0.6, "rgba(72,108,164,0.38)");
  horizon.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 0, width, height);

  const softbox = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: string,
  ) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.45, color.replace(/[\d.]+\)$/, "0.45)"));
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  ctx.filter = "blur(22px)";
  // Large warm key, upper left.
  softbox(width * 0.16, height * 0.22, 230, 150, "rgba(255,248,236,1)");
  // Tall cool strip on the right.
  softbox(width * 0.58, height * 0.38, 70, 300, "rgba(224,238,255,1)");
  // Overhead ring.
  softbox(width * 0.42, height * 0.08, 210, 70, "rgba(255,255,255,1)");
  // Cool rim from behind.
  softbox(width * 0.82, height * 0.55, 160, 110, "rgba(110,158,242,0.85)");
  // Warm bounce below.
  softbox(width * 0.3, height * 0.86, 300, 110, "rgba(246,216,170,0.82)");
  // Narrow front glint.
  softbox(width * 0.88, height * 0.3, 45, 220, "rgba(255,255,255,1)");
  // Broad frontal fill so refracted rays do not fall into pure black.
  softbox(width * 0.5, height * 0.52, 420, 300, "rgba(196,216,242,0.42)");
  // Front-top key that the table can mirror.
  softbox(width * 0.5, height * 0.26, 260, 130, "rgba(255,255,255,0.9)");
  // Horizon band reflected by the table.
  softbox(width * 0.5, height * 0.47, 300, 110, "rgba(255,255,255,0.85)");

  ctx.filter = "none";
  // Small sharp sources produce pinpoint facet flashes.
  [
    [width * 0.2, height * 0.3, 8],
    [width * 0.29, height * 0.16, 5],
    [width * 0.56, height * 0.2, 6],
    [width * 0.63, height * 0.5, 7],
    [width * 0.36, height * 0.62, 5],
    [width * 0.76, height * 0.38, 6],
    [width * 0.9, height * 0.12, 5],
    [width * 0.47, height * 0.35, 4],
  ].forEach(([x, y, radius]) => {
    const sparkle = ctx.createRadialGradient(x, y, 0, x, y, radius);
    sparkle.addColorStop(0, "rgba(255,255,255,1)");
    sparkle.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sparkle;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  if (neutral) {
    // Colour-neutral studio for inventory renders: the environment must not
    // multiply a blue cast into red, green or golden stones.
    const fill = ctx.createLinearGradient(0, 0, 0, height);
    fill.addColorStop(0, "#b8b8b8");
    fill.addColorStop(0.45, "#a0a0a0");
    fill.addColorStop(1, "#858585");
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, height);
    const panel = (x: number, y: number, w: number, h: number, colour: string) => {
      ctx.fillStyle = colour;
      ctx.fillRect(x * width, y * height, w * width, h * height);
    };
    // White softboxes separated by dark flags create readable facet contrast.
    panel(0.08, 0.12, 0.17, 0.48, "#f8f8f8");
    panel(0.29, 0.2, 0.045, 0.65, "#606060");
    panel(0.43, 0.03, 0.25, 0.16, "#eeeeee");
    panel(0.58, 0.28, 0.07, 0.55, "#ffffff");
    panel(0.73, 0.16, 0.12, 0.5, "#686868");
    panel(0.88, 0.25, 0.06, 0.58, "#dddddd");
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  if (neutral) neutralCached = texture;
  else cached = texture;
  return texture;
}
