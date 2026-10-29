// Reusable "shiny spinning gems" effect. Lazy-loads three, GSAP and Lenis.
// Usage: const shine = await initGemShine(containerEl, { gems: [...], layout: 'stack' }); shine.destroy();

export type GemShineLayout = "stack" | "hero-rings";

export interface GemShineOptions {
  gems: string[];
  layout?: GemShineLayout;
  bloom?: boolean;
  idleSpeed?: number;
  scrollSpeed?: number;
  maxDpr?: number;
  fallbackImage?: string;
}

export interface GemShineHandle {
  destroy(): void;
}

const isSmallScreen = () => window.matchMedia("(max-width: 767px)").matches;
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function showFallback(container: HTMLElement, image?: string): GemShineHandle {
  const img = document.createElement("img");
  img.src = image ?? "";
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.style.cssText = "width:100%;height:100%;object-fit:contain;";
  container.appendChild(img);
  return {
    destroy() {
      img.remove();
    },
  };
}

export async function initGemShine(
  container: HTMLElement,
  options: GemShineOptions,
): Promise<GemShineHandle> {
  const {
    gems,
    layout = "stack",
    bloom = false,
    idleSpeed = 0.25,
    scrollSpeed = 1,
    maxDpr = 2,
    fallbackImage,
  } = options;

  const THREE = await import("three");
  const { GLTFLoader } = await import(
    "three/examples/jsm/loaders/GLTFLoader.js"
  );
  const { EffectComposer } = await import(
    "three/examples/jsm/postprocessing/EffectComposer.js"
  );
  const { RenderPass } = await import(
    "three/examples/jsm/postprocessing/RenderPass.js"
  );
  const { UnrealBloomPass } = await import(
    "three/examples/jsm/postprocessing/UnrealBloomPass.js"
  );
  const { OutputPass } = await import(
    "three/examples/jsm/postprocessing/OutputPass.js"
  );
  const { gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  const Lenis = (await import("lenis")).default;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  container.appendChild(canvas);

  let renderer: InstanceType<typeof THREE.WebGLRenderer>;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    canvas.remove();
    return showFallback(container, fallbackImage);
  }

  const reduced = prefersReducedMotion();
  const small = isSmallScreen();
  const dpr = Math.min(window.devicePixelRatio, small ? 1.5 : maxDpr, 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Studio environment: dark room with bright rectangular panels for facet flashes.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x05070c);
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: 0x05070c, side: THREE.BackSide })));
  const panelPositions: [number, number, number][] = [
    [-6, 4, 4], [6, 3, 3], [0, 7, -2], [-4, -3, 6],
  ];
  panelPositions.forEach(([x, y, z], i) => {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 1.6),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0, 0, 1 - i * 0.05), side: THREE.DoubleSide }),
    );
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    envScene.add(panel);
  });
  const envTexture = pmrem.fromScene(envScene, 0.02).texture;
  scene.environment = envTexture;

  // 2-3 point lights for extra glints.
  const glintColors = [0xffffff, 0xcfe4ff, 0xffe9c2];
  glintColors.forEach((color, i) => {
    const light = new THREE.PointLight(color, 40, 20, 2);
    light.position.set(i === 0 ? 3 : -3, i === 2 ? -2 : 2, 4);
    scene.add(light);
  });

  // Next: group + gem loading, layout, animation loop (see below).
  const root = new THREE.Group();
  scene.add(root);

  const loader = new GLTFLoader();
  const loaded: InstanceType<typeof THREE.Group>[] = [];
  const disposables: { dispose(): void }[] = [];
  const materials: InstanceType<typeof THREE.MeshPhysicalMaterial>[] = [];

  const gemMaterial = (color: string | number) => {
    const m = new THREE.MeshPhysicalMaterial({
      color,
      transmission: 1,
      ior: 2.35,
      thickness: 1.4,
      roughness: 0,
      clearcoat: 1,
      attenuationColor: new THREE.Color(color),
      attenuationDistance: 0.6,
      envMapIntensity: 2.5,
      flatShading: true,
    });
    materials.push(m);
    return m;
  };

  const gemsToLoad =
    layout === "hero-rings"
      ? gems.slice(0, 1)
      : small
        ? gems.slice(0, Math.min(gems.length, 4))
        : gems;
  const results = await Promise.allSettled(
    gemsToLoad.map((url) => loader.loadAsync(url)),
  );
  let anyLoaded = false;
  results.forEach((result) => {
    if (result.status !== "fulfilled") return;
    anyLoaded = true;
    const model = result.value.scene;
    model.traverse((child) => {
      const mesh = child as InstanceType<typeof THREE.Mesh>;
      if (!mesh.isMesh) return;
      mesh.geometry.computeVertexNormals();
      mesh.material = gemMaterial(0xffffff);
      disposables.push(mesh.geometry);
    });
    loaded.push(model);
    root.add(model);
  });

  if (!anyLoaded) {
    renderer.dispose();
    canvas.remove();
    pmrem.dispose();
    return showFallback(container, fallbackImage);
  }
  // Layout: stack gems vertically, or hero-rings: one gem with metallic orbit rings.
  const rings: InstanceType<typeof THREE.Mesh>[] = [];
  if (layout === "hero-rings") {
    loaded.forEach((model) => {
      model.position.set(0, 0, 0);
      model.scale.setScalar(1.4);
    });
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a96e,
      metalness: 1,
      roughness: 0.22,
      envMapIntensity: 1.6,
    });
    materials.push(ringMaterial as unknown as InstanceType<typeof THREE.MeshPhysicalMaterial>);
    [
      { radius: 2.6, tilt: [1.1, 0.2, 0] as const },
      { radius: 3.1, tilt: [0.35, 0.7, 0.3] as const },
    ].forEach(({ radius, tilt }) => {
      const geometry = new THREE.TorusGeometry(radius, 0.018, 16, 160);
      const ring = new THREE.Mesh(geometry, ringMaterial);
      ring.rotation.set(tilt[0], tilt[1], tilt[2]);
      disposables.push(geometry);
      rings.push(ring);
      root.add(ring);
    });
  } else {
    const count = loaded.length;
    loaded.forEach((model, i) => {
      const spread = 3.2;
      model.position.set(0, (count / 2 - i - 0.5) * spread, 0);
      model.scale.setScalar(0.9);
    });
  }

  // Scroll drives rotation; lerp toward the target each frame.
  const lenis = reduced ? null : new Lenis({ lerp: 0.09 });
  gsap.registerPlugin(ScrollTrigger);
  let scrollTarget = 0;
  let scrollCurrent = 0;
  const scrollTween = reduced
    ? null
    : ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          scrollTarget = self.progress * Math.PI * 2 * scrollSpeed;
        },
      });
  const onLenisFrame = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(onLenisFrame);

  // Mouse parallax (desktop only).
  let pointerX = 0;
  let pointerY = 0;
  const onPointer = (event: PointerEvent) => {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = (event.clientY / window.innerHeight) * 2 - 1;
  };
  if (!small && !reduced) window.addEventListener("pointermove", onPointer, { passive: true });


  // Resize to the container; ResizeObserver keeps the canvas fitted.
  const resize = () => {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // Pause rendering when off-screen or the tab is hidden.
  let visible = true;
  let running = false;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(container);
  const onVisibility = () => {
    running = !document.hidden;
  };
  document.addEventListener("visibilitychange", onVisibility);
  onVisibility();

  // Optional subtle bloom for the glints.
  let composer: InstanceType<typeof EffectComposer> | null = null;
  if (bloom && !small) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.35, 0.4, 0.92));
    composer.addPass(new OutputPass());
  }

  // Idle spin plus scroll-driven rotation, eased per frame.
  let frameId = 0;
  const clock = new THREE.Clock();
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    if (!visible || !running) return;
    const delta = clock.getDelta();
    const idle = reduced ? 0 : idleSpeed * delta;
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.08;
    const yaw = reduced ? 0 : scrollCurrent;
    loaded.forEach((model, i) => {
      model.rotation.y += idle * (i % 2 === 0 ? 1 : -1);
      model.rotation.x = yaw * 0.25;
    });
    rings.forEach((ring, i) => {
      ring.rotation.z += (i % 2 === 0 ? 1 : -1) * idle * 1.6;
    });
    if (!small && !reduced) {
      root.rotation.y += (pointerX * 0.15 - root.rotation.y) * 0.05;
      root.rotation.x += (pointerY * 0.1 - root.rotation.x) * 0.05;
    }
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };
  animate();

  return {
    destroy() {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      gsap.ticker.remove(onLenisFrame);
      scrollTween?.kill();
      lenis?.destroy();
      disposables.forEach((d) => d.dispose());
      materials.forEach((m) => m.dispose());
      envTexture.dispose();
      pmrem.dispose();
      composer?.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
