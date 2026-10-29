import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import GemModelPreview from "@/components/three/GemModelPreview";
import Reveal from "@/components/ui/Reveal";
import { gemstones } from "@/data/gemstones";

const principles = [
  {
    title: "Careful Selection",
    copy: "Gemstones considered for their colour, cut, character, and individual qualities.",
  },
  {
    title: "Transparent Information",
    copy: "Clear communication of known origins and treatment details.",
  },
  {
    title: "Certification Support",
    copy: "Independent laboratory reports and certification information where available.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#061019]"
      aria-labelledby="about-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[44rem] w-[44rem] bg-[radial-gradient(circle_at_70%_30%,rgba(33,78,154,0.22),transparent_65%)]"
      />
      <div className="container-luxe relative section">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-24">
          <div>
            <Reveal>
              <p className="eyebrow">Our Standard</p>
              <h2
                id="about-heading"
                className="display mt-6 max-w-xl text-[clamp(2.8rem,5.3vw,4.8rem)] text-ivory"
              >
                Trust Begins With
                <br />
                <span className="italic text-gold-soft/92">What We Disclose.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="prose-luxe mt-7 max-w-xl">
                K Gems International connects collectors, jewellers and private
                clients with distinctive gemstones selected through experienced
                evaluation. We communicate known origin, treatment status and
                certification information clearly, helping customers make
                informed purchasing decisions with confidence.
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <ol className="mt-11 space-y-0 border-t border-gold/20">
                {principles.map((principle, index) => (
                  <li
                    key={principle.title}
                    className="grid gap-2 border-b border-gold/12 py-6 sm:grid-cols-[2.5rem_1fr] sm:gap-4"
                  >
                    <span className="font-serif text-[1.1rem] text-gold/50">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="font-serif text-[1.45rem] text-ivory">
                        {principle.title}
                      </h3>
                      <p className="mt-1.5 max-w-md text-[0.8rem] leading-relaxed text-ivory/72">
                        {principle.copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Link href="/#trust" className="link-underline">
                  Our documentation approach
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <p className="text-[0.8rem] uppercase tracking-[0.18em] text-ivory/62">
                  Colombo · Oddamavadi
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="relative">
            <div className="relative mx-auto max-w-[28rem]">
              <div
                aria-hidden
                className="absolute -inset-6 border border-gold/15"
              />
              <div className="absolute -left-4 top-10 hidden h-32 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent sm:block" aria-hidden />
              <div className="relative overflow-hidden border border-gold/25 bg-[#050c15]">
                <GemModelPreview gem={gemstones[0]} className="aspect-[4/5] w-full" />
                <div className="absolute inset-x-0 bottom-0 border-t border-gold/20 bg-gradient-to-t from-[#050c15] via-[#050c15]/85 to-transparent px-6 pb-5 pt-14">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-gold/80">
                    The Ceylon Sapphire
                  </p>
                  <p className="mt-2 font-serif text-[1.5rem] italic text-ivory/90">
                    Colour, cut and character.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-4 hidden border border-gold/25 bg-[#061019] px-5 py-4 sm:block">
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-ivory/62">
                  Considered
                </p>
                <p className="mt-1 font-serif text-[1.2rem] text-gold-soft">
                  Individually
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
