"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import GemModelPreview from "@/components/three/GemModelPreview";
import { gemstones } from "@/data/gemstones";

export default function SelectionExperience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const [nearStage, setNearStage] = useState(false);
  const gem = gemstones[selected];

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearStage(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const selectStone = (index: number) => {
    if (index === selected) return;
    setSelected(index);
  };

  return (
    <section id="selection" className="relative overflow-hidden bg-[#091827] text-ivory" aria-labelledby="selection-heading">
      <div aria-hidden className="pointer-events-none absolute -right-48 top-0 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(48,91,151,0.18),transparent_68%)]" />
      <div className="container-luxe relative section">
        <div className="grid gap-8 border-t border-gold/20 pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow">The Selection</p>
            <h2 id="selection-heading" className="display mt-5 text-[clamp(2.8rem,6vw,5.2rem)] text-ivory">A Stone of<br /><span className="italic text-gold-soft/90">Your Own.</span></h2>
          </div>
          <p className="max-w-xl text-[0.95rem] leading-[1.85] text-ivory/65">Explore six distinctive gemstones, each presented in its own natural colour. Choose a stone to see its existing model and learn more.</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-center lg:gap-16">
          <div ref={stageRef} className="relative mx-auto w-full max-w-[36rem] overflow-hidden border border-gold/20 bg-[#13253b]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(72,110,165,0.2),transparent_62%)]" />
            <div className="pointer-events-none absolute inset-[9%] rounded-full border border-gold/15" />
            <div className="pointer-events-none absolute inset-[16%] animate-[orbit_22s_linear_infinite] rounded-full border border-dashed border-ivory/10 motion-reduce:animate-none" />
            <div className="relative aspect-[5/4]">
              {(nearStage || typeof IntersectionObserver === "undefined") && (
                <GemModelPreview key={gem.slug} gem={gem} className="absolute inset-0 h-full w-full" allowRetry={false} />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-[0.72rem] uppercase tracking-[0.26em] text-gold/80">{gem.family} · {gem.colour}</p>
            <h3 className="display mt-3 text-[clamp(2rem,4vw,3.5rem)] leading-tight text-ivory">{gem.name}</h3>
            <p className="mt-5 max-w-lg text-[0.9rem] leading-[1.85] text-ivory/65">{gem.blurb}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/collection/${gem.slug}`} className="btn btn--solid">View Details <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></Link>
              <Link href={`/enquiry?stone=${encodeURIComponent(gem.reference)}`} className="btn btn--ghost">Request a Gemstone</Link>
            </div>
            <div className="mt-9 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Choose a gemstone">
              {gemstones.map((stone, index) => (
                <button key={stone.slug} type="button" onClick={() => selectStone(index)} aria-pressed={selected === index} aria-label={`Show ${stone.name}`} className={`min-h-[3.4rem] border px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${selected === index ? "border-gold/70 bg-gold/10 text-gold-soft" : "border-ivory/12 text-ivory/65 hover:border-gold/35 hover:text-ivory"}`}>
                  <span className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.12em]"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${selected === index ? "bg-gold" : "bg-ivory/30"}`} aria-hidden />{stone.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
