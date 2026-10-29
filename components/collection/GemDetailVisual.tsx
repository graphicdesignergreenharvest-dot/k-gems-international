"use client";

import GemModelPreview from "@/components/three/GemModelPreview";
import type { Gemstone } from "@/data/gemstones";

export default function GemDetailVisual({ gem }: { gem: Gemstone }) {
  return (
    <div>
      <div className="relative overflow-hidden border border-gold/25 bg-[#22395a]">
        <GemModelPreview gem={gem} className="aspect-[4/5] w-full" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
      </div>
      <p className="mt-3 text-[0.8rem] leading-relaxed text-ivory/62">
        Colour, tone and facet appearance vary with light and screen. This
        digitally rendered 3D model is illustrative and not a photograph of the
        listed stone.
      </p>
    </div>
  );
}
