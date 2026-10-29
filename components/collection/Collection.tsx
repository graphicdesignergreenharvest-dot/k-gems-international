"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Info, RotateCcw, Search, X } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import GemModelPreview from "@/components/three/GemModelPreview";
import {
  availabilityOptions,
  families,
  gemstones,
  type GemAvailability,
  type GemFamily,
} from "@/data/gemstones";

function GemstoneCard({
  gem,
  index,
}: {
  gem: (typeof gemstones)[number];
  index: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { rootMargin: "150px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Reveal delay={(index % 3) * 0.08} className="h-full">
      <article className="group relative flex h-full flex-col overflow-hidden border border-ink/12 bg-[#071525] transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-gold/50">
        <Link
          href={`/collection/${gem.slug}`}
          className="relative block aspect-[5/6] overflow-hidden bg-[#22395a]"
          aria-label={`View details of the ${gem.name}, ${gem.reference}`}
        >
          <div ref={containerRef} className="absolute inset-0 transition-transform duration-[1400ms] ease-out group-hover:scale-[1.045] motion-reduce:transition-none">
            {visible && (
              <GemModelPreview gem={gem} className="absolute inset-0 h-full w-full" />
            )}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#071525]/90 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span
              className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[0.72rem] uppercase tracking-[0.2em] backdrop-blur-sm ${
                gem.status === "Available"
                  ? "border-gold/40 bg-[#071525]/65 text-gold-soft"
                  : "border-ivory/20 bg-[#071525]/65 text-ivory/50"
              }`}
            >
              <span
                className={`h-1 w-1 rounded-full ${
                  gem.status === "Available" ? "bg-gold" : "bg-ivory/40"
                }`}
                aria-hidden
              />
              {gem.status}
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-gold/30 bg-[#071525]/50 text-gold opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-gold/80">
              {gem.family}
            </p>
            <p className="font-mono-ref text-[0.72rem] tracking-[0.16em] text-ivory/62">
              {gem.reference}
            </p>
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-[1.55rem] leading-tight text-ivory">
            <Link
              href={`/collection/${gem.slug}`}
              className="transition-colors hover:text-gold-soft focus-visible:text-gold-soft"
            >
              {gem.name}
            </Link>
          </h3>
          <dl className="mt-5 grid grid-cols-3 gap-2 border-y border-ivory/10 py-3.5 text-[0.8rem]">
            <div>
              <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-ivory/62">
                Weight
              </dt>
              <dd className="mt-1 text-ivory/72">{gem.weight}</dd>
            </div>
            <div>
              <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-ivory/62">
                Colour
              </dt>
              <dd className="mt-1 text-ivory/72">{gem.colour}</dd>
            </div>
            <div>
              <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-ivory/62">
                Cut
              </dt>
              <dd className="mt-1 text-ivory/72">{gem.cut}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.8rem] text-ivory/62">{gem.origin}</p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <Link
              href={`/collection/${gem.slug}`}
              className="text-[0.72rem] uppercase tracking-[0.18em] text-ivory/72 underline-offset-4 transition-colors hover:text-gold-soft hover:underline focus-visible:text-gold-soft"
            >
              View details
            </Link>
            <Link
              href={`/enquiry?stone=${encodeURIComponent(gem.reference)}`}
              className="inline-flex min-h-10 items-center border border-gold/40 px-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-gold transition-colors hover:border-gold hover:bg-gold/10 focus-visible:border-gold focus-visible:bg-gold/10"
            >
              {gem.status === "Available" ? "Request price" : "Enquire"}
              <span className="sr-only"> for the {gem.name}</span>
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function Collection() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [family, setFamily] = useState<GemFamily | "All">("All");
  const [availability, setAvailability] = useState<GemAvailability | "All">(
    "All",
  );

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return gemstones.filter((gem) => {
      const matchesFamily = family === "All" || gem.family === family;
      const matchesAvailability =
        availability === "All" || gem.status === availability;
      const matchesSearch =
        query.length === 0 ||
        `${gem.name} ${gem.colour} ${gem.reference} ${gem.family} ${gem.origin}`
          .toLowerCase()
          .includes(query);
      return matchesFamily && matchesAvailability && matchesSearch;
    });
  }, [deferredSearch, family, availability]);

  const hasFilters =
    search.trim().length > 0 || family !== "All" || availability !== "All";

  const reset = () => {
    setSearch("");
    setFamily("All");
    setAvailability("All");
  };

  return (
    <section
      id="collection"
      className="relative overflow-hidden bg-ivory text-ink"
      aria-labelledby="collection-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.16),transparent_65%)]"
      />
      <div className="container-luxe relative section">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20">
          <Reveal>
            <p className="eyebrow !text-[#96763f]">The Collection</p>
            <h2
              id="collection-heading"
              className="display mt-6 max-w-2xl text-[clamp(2.65rem,5.4vw,4.8rem)] text-ink"
            >
              Exceptional Stones,
              <br />
              <span className="italic text-[#8f7040]">Considered Individually.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xl text-[0.95rem] leading-[1.85] text-ink/62">
              Every gemstone is unique. Explore its known characteristics and
              contact our team for availability, documentation, and a private
              quotation.
            </p>
            <p className="mt-5 flex max-w-xl items-start gap-2.5 border-t border-ink/10 pt-4 text-[0.7rem] leading-relaxed text-ink/70">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#96763f]" aria-hidden />
              Demonstration listings. Reference numbers, specifications and
              availability are sample content pending verification against
              current inventory.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 border-y border-ink/12 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-[22rem]">
              <label htmlFor="gem-search" className="sr-only">
                Search gemstones by name, colour or reference
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/70"
                aria-hidden
              />
              <input
                id="gem-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, colour or reference"
                className="h-12 w-full border border-ink/15 bg-white/60 pl-11 pr-10 text-[0.82rem] text-ink outline-none transition-colors placeholder:text-ink/70 focus:border-[#96763f]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-ink/70 transition-colors hover:text-ink"
                >
                  <span className="sr-only">Clear search</span>
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>

            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filter by gemstone family"
            >
              {families.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={family === item}
                  onClick={() => setFamily(item)}
                  className={`border px-4 py-2.5 text-[0.8rem] uppercase tracking-[0.18em] transition-all duration-300 ${
                    family === item
                      ? "border-ink bg-ink text-ivory"
                      : "border-ink/15 text-ink/58 hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="availability"
                className="text-[0.72rem] uppercase tracking-[0.18em] text-ink/70"
              >
                Availability
              </label>
              <select
                id="availability"
                value={availability}
                onChange={(event) =>
                  setAvailability(event.target.value as GemAvailability | "All")
                }
                className="h-10 border border-ink/15 bg-white/60 px-3 pr-8 text-[0.72rem] text-ink outline-none focus:border-[#96763f]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23111318' fill='none'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.7rem center",
                  appearance: "none",
                }}
              >
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 text-[0.8rem] text-ink/70">
            <p aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "gemstone" : "gemstones"}
              {hasFilters ? " matching your selection" : " in the collection"}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 text-[0.8rem] uppercase tracking-[0.16em] text-[#8f7040] transition-colors hover:text-ink"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                Reset filters
              </button>
            )}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((gem, index) => (
              <GemstoneCard key={gem.slug} gem={gem} index={index} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center border border-dashed border-ink/20 bg-white/40 px-6 py-24 text-center">
            <p className="font-serif text-[2rem] text-ink">
              No stones match those filters.
            </p>
            <p className="mt-3 max-w-md text-[0.85rem] leading-relaxed text-ink/55">
              Try a different gemstone family or colour, or reset the filters to
              view the full collection.
            </p>
            <button type="button" onClick={reset} className="btn btn--dark btn--sm mt-7">
              Reset filters
            </button>
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-8">
          <p className="max-w-xl text-[0.72rem] leading-relaxed text-ink/70">
            Looking for a particular colour, size or budget? Share what you have
            in mind and our team will respond with suitable options.
          </p>
          <Link href="/enquiry" className="btn btn--outline-dark btn--sm">
            Request a Quotation
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
