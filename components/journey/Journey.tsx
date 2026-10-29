"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Hammer,
  Microscope,
  Mountain,
  Scissors,
  Sparkles,
  Store,
} from "lucide-react";
import { useReducedMotionPreference } from "@/lib/useClientCapabilities";

const FRAME_COUNT = 200;
const FRAME_PRELOAD_RADIUS = 4;
const frameSrc = (index: number) =>
  `/journey/frame_${String(index + 1).padStart(3, "0")}.jpg`;

function frameIndexFor(progress: number) {
  const index = Math.round(progress * (FRAME_COUNT - 1));
  return Math.min(FRAME_COUNT - 1, Math.max(0, index));
}

/** Representative peak frame for each chapter (0 to 5) */
const chapterKeyFrames = [0, 39, 84, 119, 159, 199] as const;

/** Accurate mapping from the active canvas frame to its corresponding chapter */
function chapterIndexForProgress(progress: number): number {
  const frame = frameIndexFor(progress);
  if (frame < 19) return 0;   // Chapter 1: Discovery (rough stone in earth)
  if (frame < 70) return 1;   // Chapter 2: Cutting & Polishing (lapidary faceting machine)
  if (frame < 105) return 2;  // Chapter 3: Examination (microscope & gemologist)
  if (frame < 138) return 3;  // Chapter 4: Craftsmanship (jeweller bench setting stone)
  if (frame < 187) return 4;  // Chapter 5: Presentation (luxury showroom bust & cases)
  return 5;                   // Chapter 6: The Reveal (portrait wearing finished jewel)
}

/** Frame shown on each chapter card in the static (reduced-motion) layout. */
function frameForChapter(chapterIndex: number) {
  return chapterKeyFrames[chapterIndex] ?? 0;
}

/** Draws an image onto the canvas, fitted whole inside it (like object-fit: contain). */
function drawFrame(canvas: HTMLCanvasElement, img: HTMLImageElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const scale = Math.min(
    canvas.width / img.naturalWidth,
    canvas.height / img.naturalHeight,
  );
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}

const chapters = [
  {
    id: "discovery",
    label: "Discovery",
    headline: "Every Stone Has a Beginning.",
    copy: "Beneath the earth, nature creates something extraordinary.",
    detail:
      "A single rough sapphire, still shaped by the ground that held it. This is where its story begins.",
    icon: Mountain,
    tint: "from-[#1a120b] via-[#071525] to-[#071525]",
    accent: "#b07f48",
    portrait: "rough",
  },
  {
    id: "cutting",
    label: "Cutting & Polishing",
    headline: "Refined by Precision.",
    copy: "Through skilled hands and careful craftsmanship, rough stone becomes a work of natural brilliance.",
    detail:
      "Proportion, symmetry and patience. Each facet is considered, each polish deliberately controlled.",
    icon: Scissors,
    tint: "from-[#101923] via-[#071525] to-[#071525]",
    accent: "#9aa3ad",
    portrait: "cut",
  },
  {
    id: "laboratory",
    label: "Examination",
    headline: "Examined With Care.",
    copy: "Detailed examination helps establish the characteristics of each individual gemstone.",
    detail:
      "Colour, clarity and character are observed under controlled light and magnification.",
    icon: Microscope,
    tint: "from-[#111a24] via-[#0a1724] to-[#071525]",
    accent: "#b7c7d8",
    portrait: "lab",
  },
  {
    id: "craft",
    label: "Craftsmanship",
    headline: "Shaped by Human Hands.",
    copy: "An exceptional gemstone becomes part of a lasting expression of craftsmanship.",
    detail:
      "A setting is formed around the stone, then refined until metal and gemstone belong together.",
    icon: Hammer,
    tint: "from-[#1c140c] via-[#0c1520] to-[#071525]",
    accent: "#c9a96e",
    portrait: "ring",
  },
  {
    id: "showroom",
    label: "Presentation",
    headline: "Presented With Elegance.",
    copy: "Discover the finished beauty of thoughtfully crafted gemstone jewellery.",
    detail:
      "The completed collection is brought together in a private setting, considered from every angle.",
    icon: Store,
    tint: "from-[#1a1710] via-[#0b1724] to-[#071525]",
    accent: "#d3b989",
    portrait: "showroom",
  },
  {
    id: "fashion",
    label: "The Reveal",
    headline: "Made to Be Worn. Made to Be Remembered.",
    copy: "Discover jewellery that brings the character of exceptional gemstones into everyday elegance and special moments.",
    detail:
      "The final expression is personal: a stone chosen for its character, worn for years to come.",
    icon: Sparkles,
    tint: "from-[#16110c] via-[#0a1421] to-[#071525]",
    accent: "#e0c495",
    portrait: "final",
  },
] as const;

function JourneyIntro() {
  return (
    <div className="container-luxe relative pb-16 pt-24 sm:pt-28 lg:pb-24 lg:pt-36">
      <div className="grid gap-10 border-t border-gold/20 pt-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div>
          <p className="eyebrow">Our Journey</p>
          <h2 className="display mt-6 text-[clamp(2.8rem,6vw,5.2rem)] text-ivory">
            From Earth
            <br />
            <span className="italic text-gold-soft/90">to Elegance.</span>
          </h2>
        </div>
        <div className="flex flex-col justify-end gap-7 lg:pb-3">
          <p className="prose-luxe max-w-xl">
            Follow one sapphire through six chapters — from the earth that
            formed it, through the hands that shape it, to the person who wears
            it. A continuous journey of nature, skill and care.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.8rem] uppercase tracking-[0.22em] text-ivory/62">
            <span className="flex items-center gap-2">
              <span className="h-px w-6 bg-gold/60" aria-hidden />
              Six chapters
            </span>
            <span className="flex items-center gap-2">
              <span className="h-px w-6 bg-gold/60" aria-hidden />
              One stone
            </span>
            <span className="flex items-center gap-2">
              <span className="h-px w-6 bg-gold/60" aria-hidden />
              Scroll to continue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function JourneyStatic() {
  return (
    <div className="bg-ink">
      <JourneyIntro />
      <div className="container-luxe pb-24">
        <div className="grid gap-16 lg:gap-24">
          {chapters.map((chapter, index) => {
            const Icon = chapter.icon;
            const reverse = index % 2 === 1;
            return (
              <article
                key={chapter.id}
                className={`grid items-center gap-8 border-t border-gold/15 pt-10 lg:grid-cols-2 lg:gap-16 ${
                  reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-[1.6rem] text-gold/45">
                      0{index + 1}
                    </span>
                    <span
                      className="h-px w-10"
                      style={{ backgroundColor: chapter.accent }}
                      aria-hidden
                    />
                    <Icon
                      className="h-4 w-4"
                      style={{ color: chapter.accent }}
                      aria-hidden
                    />
                    <p className="text-[0.72rem] uppercase tracking-[0.24em] text-ivory/72">
                      {chapter.label}
                    </p>
                  </div>
                  <h3 className="display mt-6 max-w-lg text-[clamp(2.1rem,4vw,3.4rem)] text-ivory">
                    {chapter.headline}
                  </h3>
                  <p className="mt-5 max-w-md text-[0.92rem] leading-[1.85] text-ivory/58">
                    {chapter.copy}
                  </p>
                  <p className="mt-4 max-w-md text-[0.78rem] leading-relaxed text-ivory/62">
                    {chapter.detail}
                  </p>
                </div>
                <div className="relative aspect-video overflow-hidden border border-gold/15 bg-[#050c15]">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${chapter.tint} opacity-70`}
                    aria-hidden
                  />
                  <Image
                    src={frameSrc(frameForChapter(index))}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover opacity-90"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-gold/15 bg-[#050c15]/70 px-5 py-3 text-[0.72rem] uppercase tracking-[0.22em] text-gold/75 backdrop-blur-sm">
                    <span>Chapter 0{index + 1}</span>
                    <span className="text-ivory/62">{chapter.label}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-16 flex flex-wrap gap-3 border-t border-gold/15 pt-10">
          <Link href="/#collection" className="btn btn--solid">
            Explore the Collection
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link href="/#enquiry" className="btn btn--ghost">
            Request a Gemstone
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Journey() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef(new Map<number, HTMLImageElement>());
  const drawnIndex = useRef(-1);
  const lastProgress = useRef(0);
  const progressBar = useRef<HTMLSpanElement>(null);
  const lastActive = useRef(0);

  const reduced = useReducedMotionPreference();
  const [active, setActive] = useState(0);

  // Draws the frame for a scroll progress value (0–1). Skips redundant draws.
  const renderFrame = useCallback((progress: number, force = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    lastProgress.current = progress;
    const index = frameIndexFor(progress);
    if (!force && index === drawnIndex.current) return;

    // Keep only nearby frames rather than decoding all 200 full-size JPGs.
    const frames = framesRef.current;
    for (const [cachedIndex, image] of frames) {
      if (Math.abs(cachedIndex - index) > FRAME_PRELOAD_RADIUS) {
        image.onload = null;
        frames.delete(cachedIndex);
      }
    }
    const loadFrame = (frame: number) => {
      if (frame < 0 || frame >= FRAME_COUNT || frames.has(frame)) return;
      const image = new window.Image();
      frames.set(frame, image);
      image.onload = () => {
        if (frameIndexFor(lastProgress.current) !== frame) return;
        drawnIndex.current = frame;
        drawFrame(canvas, image);
      };
      image.src = frameSrc(frame);
    };
    loadFrame(index);
    for (let offset = 1; offset <= FRAME_PRELOAD_RADIUS; offset += 1) {
      loadFrame(index + offset);
      loadFrame(index - offset);
    }

    const img = frames.get(index);
    if (!img?.complete || !img.naturalWidth) return;
    drawnIndex.current = index;
    drawFrame(canvas, img);
  }, []);

  // Load the initial frame window and size the canvas to the pinned viewport.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (reduced || !canvas) return;
    const frames = framesRef.current;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      renderFrame(lastProgress.current, true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      for (const image of frames.values()) image.onload = null;
      frames.clear();
      drawnIndex.current = -1;
    };
  }, [reduced, renderFrame]);

  useEffect(() => {
    if (reduced || !pinRef.current) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    let cleanupRefresh: (() => void) | undefined;

    const setup = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !pinRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // The wrapper is tall and the scene inside it is CSS `sticky`, so the
        // browser releases the scene exactly at the wrapper's end. ScrollTrigger
        // tracks progress here and coordinates frame drawing and chapter changes.
        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          refreshPriority: -1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            renderFrame(self.progress);
            const index = chapterIndexForProgress(self.progress);
            if (index !== lastActive.current) {
              lastActive.current = index;
              setActive(index);
            }
            if (progressBar.current) {
              progressBar.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        });
      }, pinRef);

      requestAnimationFrame(() => ScrollTrigger.refresh());

      // Re-measure the pin distance once fonts/images settle and when the
      // viewport height changes, so the pinned scene releases at its reserved end.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      window.addEventListener("resize", refresh);
      cleanupRefresh = () => {
        window.removeEventListener("load", refresh);
        window.removeEventListener("resize", refresh);
      };
    };

    void setup();
    return () => {
      cancelled = true;
      cleanupRefresh?.();
      ctx?.revert();
    };
  }, [reduced, renderFrame]);

  if (reduced) {
    return (
      <section id="journey" aria-label="The gemstone journey">
        <JourneyStatic />
      </section>
    );
  }

  return (
    <section id="journey" className="relative bg-ink" aria-label="The gemstone journey">
      <JourneyIntro />

      <div ref={wrapperRef} className="relative h-[540svh] min-[820px]:h-[670svh]">
      <div
        ref={pinRef}
        className="sticky top-0 h-[100svh] min-h-[680px] w-full overflow-hidden bg-ink"
      >
        {/* 1. Base Canvas - draws the 200-frame filmstrip fitted into the image panel */}
        <div className="absolute inset-x-0 top-0 aspect-video lg:inset-y-0 lg:aspect-auto lg:left-[44%] lg:right-0">
          <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 h-full w-full"
          />
        </div>

        {/* 2. Scene atmospheres - soft color wash over the canvas */}
        {chapters.map((chapter, index) => (
          <div
            key={chapter.id}
            aria-hidden
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${chapter.tint} mix-blend-color transition-opacity duration-[900ms] ${
              active === index ? "opacity-35" : "opacity-0"
            }`}
          />
        ))}

        {/* 3. Vignette & Contrast Overlays - ensures text legibility and covers corner watermark */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(7,20,38,0.2),transparent_65%)]" />
          <div className="hidden lg:block absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#071426]/90 via-[#071426]/50 to-transparent" />
          <div className="absolute right-[8%] top-[22%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.08),transparent_68%)] blur-2xl" />
        </div>

        {/* Chapter counter */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden lg:block">
          <div className="container-luxe flex items-center justify-between pt-24 text-[0.72rem] uppercase tracking-[0.26em] text-ivory/72 sm:pt-28">
            <span className="flex items-center gap-3">
              <span className="text-gold">0{active + 1}</span>
              <span className="h-px w-8 bg-gold/40" aria-hidden />
              <span>{chapters[active].label}</span>
            </span>
            <span className="hidden items-center gap-3 sm:flex">
              <span>Chapter</span>
              <span className="text-gold">
                0{active + 1} / 0{chapters.length}
              </span>
            </span>
          </div>
        </div>

        {/* Scene copy */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div className="container-luxe relative min-h-[19rem] pb-20 sm:min-h-[17rem] lg:min-h-[20rem] lg:pb-24">
            {chapters.map((chapter, index) => {
              const Icon = chapter.icon;
              const isActive = active === index;
              return (
                <div
                  key={chapter.id}
                  aria-hidden={!isActive}
                  className={`pointer-events-auto absolute bottom-16 sm:bottom-20 lg:bottom-24 border border-gold/30 bg-[#071426]/90 p-6 shadow-[0_12px_45px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-700 sm:p-8 left-4 right-4 sm:left-6 sm:right-6 lg:left-0 lg:right-auto lg:max-w-[min(38vw,31rem)] ${
                    isActive
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-6 opacity-0"
                  }`}
                >
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/80 via-gold/30 to-transparent" />
                  <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-gold/80" />
                  <span aria-hidden className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-gold/80" />
                  <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l border-gold/80" />
                  <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-gold/80" />
                  <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.24em] text-gold/90">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    <span>Chapter 0{index + 1}</span>
                    <span className="h-px w-7 bg-gold/40" aria-hidden />
                    <span className="text-ivory/80">{chapter.label}</span>
                  </div>
                  <h2 className="display mt-4 max-w-[28rem] text-[clamp(2.1rem,4.4vw,3.6rem)] text-ivory">
                    {chapter.headline}
                  </h2>
                  <p className="mt-4 max-w-md text-[0.92rem] leading-[1.8] text-ivory/90">
                    {chapter.copy}
                  </p>
                  <p className="mt-3 hidden max-w-md text-[0.8rem] leading-relaxed text-ivory/70 border-t border-gold/15 pt-3 sm:block">
                    {chapter.detail}
                  </p>
                  {index === chapters.length - 1 ? (
                    <div className="mt-6 flex flex-wrap gap-2.5">
                      <Link
                        href="/#collection"
                        className="btn btn--solid btn--sm"
                        tabIndex={isActive ? 0 : -1}
                      >
                        Explore the Collection
                        <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </Link>
                      <Link
                        href="/#enquiry"
                        className="btn btn--ghost btn--sm"
                        tabIndex={isActive ? 0 : -1}
                      >
                        Request a Gemstone
                      </Link>
                    </div>
                  ) : (
                    <p className="mt-5 hidden items-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-ivory/70 sm:flex">
                      <ArrowDown className="h-3 w-3 text-gold/70" aria-hidden />
                      Scroll to continue the journey
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom scroll progress */}
        <div className="absolute inset-x-0 bottom-0 z-30">
          <div className="container-luxe flex items-center gap-5 pb-6">
            <span className="text-[0.72rem] uppercase tracking-[0.24em] text-ivory/62">
              0{active + 1}
            </span>
            <div className="relative h-px flex-1 bg-ivory/10">
              <span
                ref={progressBar}
                className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-gold/50 via-gold to-gold-soft"
              />
              {chapters.map((_, index) => (
                <span
                  key={index}
                  className={`absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full ${
                    index <= active ? "bg-gold" : "bg-ivory/20"
                  }`}
                  style={{ left: `${(index / (chapters.length - 1)) * 100}%` }}
                />
              ))}
            </div>
            <span className="text-[0.72rem] uppercase tracking-[0.24em] text-ivory/62">
              06
            </span>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
