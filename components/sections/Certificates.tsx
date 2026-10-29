import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  FileSearch,
  Map,
  MessageCircle,
} from "lucide-react";
import GemModelPreview from "@/components/three/GemModelPreview";
import Reveal from "@/components/ui/Reveal";
import { gemstones } from "@/data/gemstones";

const areas = [
  {
    icon: Map,
    title: "Origin and Provenance Information",
    copy: "We communicate the known origin of a gemstone where that information has been established. Where origin is not confirmed, we say so rather than infer it.",
    detail: "Known origin · Supplier information · Country of discovery",
  },
  {
    icon: FileSearch,
    title: "Treatment Disclosure",
    copy: "Known treatment status is discussed before a decision is made, so you understand what has — and has not — been confirmed about the stone.",
    detail: "Known treatment · Disclosure before purchase",
  },
  {
    icon: BadgeCheck,
    title: "Independent Certification Support",
    copy: "Where an independent laboratory report exists, we share the documentation for your review. Certification is confirmed for each individual stone.",
    detail: "Laboratory reports where available · Document review",
  },
];

export default function Certificates() {
  return (
    <section
      id="trust"
      className="relative overflow-hidden bg-ivory text-ink"
      aria-labelledby="trust-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.18),transparent_66%)]"
      />
      <div className="container-luxe relative section">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end lg:gap-20">
          <Reveal>
            <p className="eyebrow !text-[#96763f]">Certificates &amp; Trust</p>
            <h2
              id="trust-heading"
              className="display mt-6 max-w-2xl text-[clamp(2.7rem,5.3vw,4.8rem)] text-ink"
            >
              Confidence in
              <br />
              <span className="italic text-[#8f7040]">Every Detail.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-lg text-[0.94rem] leading-[1.85] text-ink/60">
              Gemstones are individual by nature. Our approach is to make the
              known facts clear and to identify what still needs confirmation, so
              that every decision is an informed one.
            </p>
            <p className="mt-5 border-t border-ink/10 pt-4 text-[0.7rem] leading-relaxed text-ink/70">
              Documentation varies by stone. Details should be confirmed for each
              individual gemstone before any purchase. Where a laboratory report
              exists for a stone, we will share it with you before you decide;
              where it does not, we will tell you that plainly.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {areas.map((area, index) => {
            const Icon = area.icon;
            return (
              <Reveal key={area.title} delay={index * 0.08}>
                <article className="group flex h-full flex-col border border-ink/12 bg-white/55 p-7 transition-colors duration-500 hover:border-[#b08c52]/50">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center border border-[#96763f]/35 text-[#96763f]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="font-serif text-[1.5rem] text-ink/20">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-7 font-serif text-[1.6rem] leading-tight text-ink">
                    {area.title}
                  </h3>
                  <p className="mt-4 flex-1 text-[0.82rem] leading-[1.8] text-ink/55">
                    {area.copy}
                  </p>
                  <p className="mt-6 border-t border-ink/10 pt-4 text-[0.8rem] uppercase tracking-[0.16em] text-ink/70">
                    {area.detail}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-16 grid items-stretch gap-0 border border-ink/12 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal className="relative min-h-[22rem] overflow-hidden bg-[#061019]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_40%,rgba(30,72,146,0.38),transparent_66%)]" />
            <GemModelPreview
              gem={gemstones[0]}
              className="absolute inset-0 h-full w-full"
            />
            <div className="absolute left-6 top-6 border border-gold/25 bg-[#061019]/55 px-3 py-2 backdrop-blur-sm">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-gold/80">
                Macro detail
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061019] via-[#061019]/55 to-transparent px-7 pb-7 pt-20">
              <p className="font-serif text-[1.7rem] italic text-ivory/90">
                Look closer. Ask more.
              </p>
              <p className="mt-2 max-w-sm text-[0.72rem] leading-relaxed text-ivory/72">
                Colour, clarity and finish are best considered in person and
                under different light.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-col justify-center bg-white/55 p-8 sm:p-10 lg:p-12">
            <p className="eyebrow !text-[#96763f]">A Clear Process</p>
            <h3 className="display mt-4 text-[clamp(2rem,3.4vw,2.9rem)] text-ink">
              What to expect when you enquire.
            </h3>
            <ol className="mt-7 space-y-4">
              {[
                ["Identify the stone", "We confirm the reference, current availability and known specifications."],
                ["Review the documentation", "We share origin, treatment and certification information where it exists."],
                ["Ask your questions", "Any gaps are identified clearly before you consider a purchase."],
                ["Decide with confidence", "Arrange a private viewing or continue the conversation at your pace."],
              ].map(([title, copy], index) => (
                <li key={title} className="flex gap-4 border-b border-ink/10 pb-4 last:border-0">
                  <span className="font-serif text-[1.05rem] text-[#96763f]">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.14em] text-ink/72">
                      {title}
                    </p>
                    <p className="mt-1 text-[0.76rem] leading-relaxed text-ink/70">
                      {copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/#enquiry" className="btn btn--dark btn--sm">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                Ask about a stone
              </Link>
              <Link href="/#collection" className="btn btn--outline-dark btn--sm">
                View the collection
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
