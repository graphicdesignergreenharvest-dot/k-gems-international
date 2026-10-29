"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gemstones } from "@/data/gemstones";
import { ArrowDown, ArrowUpRight, Mouse } from "lucide-react";
import { featuredIndexForProgress, heroPhaseForProgress, type HeroSharedState } from "@/lib/heroState";
import GemModelPreview from "@/components/three/GemModelPreview";
import ViewerBoundary from "@/components/three/ViewerBoundary";
import {
  useReducedMotionPreference,
  useWebGLSupport,
} from "@/lib/useClientCapabilities";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

const phases = [
  { label: "Emergence", number: "01" },
  { label: "In Motion", number: "02" },
  { label: "The Selection", number: "03" },
  { label: "The Collection", number: "04" },
];

function HeroCopy({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow animate-fade-up" style={{ animationDelay: "0.15s" }}>
        The World of Fine Gemstones
      </p>
      <h1 className="display mt-6 text-[clamp(3.15rem,7.8vw,7.4rem)] text-ivory">
        <span
          className="block animate-fade-up"
          style={{ animationDelay: "0.28s" }}
        >
          Rare Beauty.
        </span>
        <span
          className="mt-1 block animate-fade-up italic text-gold-soft/95"
          style={{ animationDelay: "0.4s" }}
        >
          Lasting Value.
        </span>
      </h1>
      <p
        className="mt-8 max-w-[28rem] animate-fade-up text-[0.94rem] leading-[1.85] text-ivory/62 sm:text-base"
        style={{ animationDelay: "0.52s" }}
      >
        Discover exceptional gemstones, shaped by nature and revealed through
        craftsmanship.
      </p>
      <div
        className="mt-9 flex animate-fade-up flex-wrap items-center gap-3"
        style={{ animationDelay: "0.64s" }}
      >
        <Link href="/#collection" className="btn btn--solid">
          Explore Collection
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <Link href="/#enquiry" className="btn btn--ghost">
          Request a Gemstone
        </Link>
      </div>
    </div>
  );
}

function HeroStatic() {
  return (
    <div className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink pb-20 pt-28">
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_44%,rgba(21,55,118,0.42),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_80%,rgba(201,169,110,0.08),transparent_55%)]" />
      </div>
      <div className="container-luxe relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <HeroCopy />
        <div className="relative mx-auto w-full max-w-[31rem]">
          <div className="absolute inset-x-10 top-10 h-[70%] rounded-full bg-[radial-gradient(circle,rgba(47,111,228,0.35),transparent_68%)] blur-2xl" />
          <GemModelPreview gem={{ ...gemstones[0] }} className="relative aspect-[5/4] w-full" />
          <div className="pointer-events-none absolute inset-0 animate-[float_8s_ease-in-out_infinite] rounded-full border border-gold/10 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const pinRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef<HeroSharedState>({
    progress: 0,
    featured: 0,
    pointerX: 0,
    pointerY: 0,
    reduced: false,
  });
  const lastFeatured = useRef(0);
  const lastPhase = useRef(0);
  const lastEndVisible = useRef(false);
  const selectionReadyRef = useRef(false);

  const webgl = useWebGLSupport();
  const reduced = useReducedMotionPreference();
  const [canvasReady, setCanvasReady] = useState(false);
  const [selectionReady, setSelectionReady] = useState(false);
  const [cardsReady, setCardsReady] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);
  const cardsReadyRef = useRef(false);
  const [endVisible, setEndVisible] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      stateRef.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      stateRef.current.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, []);

  const handleReady = useCallback(() => setCanvasReady(true), []);

  useEffect(() => {
    stateRef.current.reduced = reduced;
    if (reduced || !webgl || !pinRef.current) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    const setup = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !pinRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const narrow = window.innerWidth < 820;
        ScrollTrigger.create({
          trigger: pinRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (narrow ? 2.15 : 2.85)}`,
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            stateRef.current.progress = progress;
            if (pinRef.current) {
              pinRef.current.dataset.progress = progress.toFixed(4);
              pinRef.current.dataset.pinStart = String(Math.round(self.start));
              pinRef.current.dataset.pinEnd = String(Math.round(self.end));
            }

            const copy = copyRef.current;
            if (copy) {
              const fade = 1 - Math.min(1, Math.max(0, (progress - 0.04) / 0.16));
              copy.style.opacity = String(fade);
              copy.style.transform = `translate3d(0, ${-26 * (1 - fade)}px, 0)`;
              copy.style.visibility = fade < 0.02 ? "hidden" : "visible";
              copy.style.pointerEvents = fade < 0.5 ? "none" : "auto";
            }

            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${progress})`;
            }

            if (progress >= 0.06 && !cardsReadyRef.current) {
              cardsReadyRef.current = true;
              setCardsReady(true);
            }

            if (progress >= 0.52 && !selectionReadyRef.current) {
              selectionReadyRef.current = true;
              setSelectionReady(true);
            }

            const nextFeatured = featuredIndexForProgress(progress);
            if (nextFeatured !== lastFeatured.current) {
              lastFeatured.current = nextFeatured;
              stateRef.current.featured = nextFeatured;
            }

            const showEnd = progress > 0.94;
            if (showEnd !== lastEndVisible.current) {
              lastEndVisible.current = showEnd;
              setEndVisible(showEnd);
            }

            const nextPhase = heroPhaseForProgress(progress);
            if (nextPhase !== lastPhase.current) {
              lastPhase.current = nextPhase;
              setPhase(nextPhase);
            }
          },
        });
      }, pinRef);

      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    void setup();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, webgl]);

  if (reduced || webgl === false || heroFailed) {
    return (
      <section id="home" className="relative bg-ink" aria-label="Introduction">
        <HeroStatic />
      </section>
    );
  }

  return (
    <section id="home" className="relative bg-ink" aria-label="Introduction">
      <div
        ref={pinRef}
        className="relative h-[100svh] min-h-[620px] w-full overflow-visible"
        data-canvas-ready={canvasReady}
      >
        {/* Cinematic environment */}
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_64%_42%,rgba(25,63,130,0.5),transparent_58%)]" />
          <div className={`pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_62%_50%,rgba(7,21,37,0.88)_0%,rgba(7,21,37,0.35)_28%,transparent_58%)] transition-opacity duration-[1800ms] ${canvasReady ? "opacity-0" : "opacity-100"}`} />
          <div className={`pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-ink via-ink/75 to-transparent transition-opacity duration-[1500ms] ${canvasReady ? "opacity-0" : "opacity-100"}`} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_78%,rgba(201,169,110,0.085),transparent_52%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(7,21,37,0.1),transparent_50%)]" />
          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(217,222,232,0.6) 0 1px, transparent 1px 12.5vw)",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/[0.055]" />
          <div className="absolute left-1/2 top-1/2 h-[52rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/[0.035]" />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <ViewerBoundary onError={() => setHeroFailed(true)}>
            <HeroScene
              stateRef={stateRef}
              cardsReady={cardsReady}
              selectionReady={selectionReady}
              onReady={handleReady}
            />
          </ViewerBoundary>
        </div>

        {/* Copy */}
        <div className="container-luxe pointer-events-none relative z-20 flex h-full items-center">
          <div
            ref={copyRef}
            className="pointer-events-auto max-w-[41rem] pt-16 sm:pt-20 lg:pt-10"
          >
            <HeroCopy />
          </div>
        </div>

        <p className={`pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2 text-[0.7rem] uppercase tracking-[0.32em] text-gold/70 transition-opacity duration-700 ${phase === 1 ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
          In Motion · Nature, revealed
        </p>



        {/* End of hero — collection formation */}
        <div
          className={`absolute inset-x-0 bottom-24 z-30 flex justify-center px-6 text-center transition-[opacity,transform] duration-700 ${endVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
            }`}
          aria-hidden={!endVisible}
        >
          <div>
            <p className="eyebrow is-plain justify-center text-[0.72rem]">
              The Collection
            </p>
            <p className="mt-3 font-serif text-[clamp(1.6rem,3.5vw,2.6rem)] text-ivory">
              Six stones. Considered individually.
            </p>
            <Link
              href="/#collection"
              className="link-underline mt-4 inline-flex"
              tabIndex={endVisible ? 0 : -1}
            >
              Explore the collection
              <ArrowDown className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Phase rail */}
        <div className="absolute right-7 top-1/2 z-20 hidden -translate-y-1/2 lg:block xl:right-12">
          <ol className="space-y-5" aria-label="Hero scroll chapters">
            {phases.map((item, index) => (
              <li
                key={item.label}
                className={`flex items-center justify-end gap-3 transition-colors duration-500 ${phase === index ? "text-gold-soft" : "text-ivory/62"
                  }`}
              >
                <span
                  className={`text-[0.72rem] tracking-[0.2em] ${phase === index ? "opacity-100" : "opacity-70"
                    }`}
                >
                  {item.number}
                </span>
                <span className="text-[0.72rem] uppercase tracking-[0.22em]">
                  {item.label}
                </span>
                <span
                  className={`h-px transition-all duration-700 ${phase === index ? "w-6 bg-gold" : "w-3 bg-current"
                    }`}
                  aria-hidden
                />
              </li>
            ))}
          </ol>
        </div>

        {/* Bottom rail */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="container-luxe flex items-center justify-between gap-6 pb-6">
            <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.24em] text-ivory/72">
              <Mouse className="h-3.5 w-3.5 text-gold/70" aria-hidden />
              <span className="hidden sm:inline">Scroll to explore</span>
              <span className="sm:hidden">Scroll</span>
              <span className="relative h-6 w-px overflow-hidden bg-ivory/15" aria-hidden>
                <span className="absolute inset-0 animate-[scroll-cue_2.4s_ease-in-out_infinite] bg-gold" />
              </span>
            </div>
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-ivory/62">
              Colombo <span className="mx-2 text-gold/40">·</span> Sri Lanka
            </p>
          </div>
          <div className="h-px w-full bg-ivory/[0.07]">
            <span
              ref={progressRef}
              className="block h-full origin-left scale-x-0 bg-gradient-to-r from-gold/60 to-gold-soft"
            />
          </div>
        </div>

        {/* Edge labels */}
        <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[0.72rem] uppercase tracking-[0.4em] text-ivory/62 xl:block">
          From Earth to Elegance
        </div>
      </div>
    </section>
  );
}
