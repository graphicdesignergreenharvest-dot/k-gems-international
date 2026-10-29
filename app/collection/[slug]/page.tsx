import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Info,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import GemDetailVisual from "@/components/collection/GemDetailVisual";
import GemModelPreview from "@/components/three/GemModelPreview";
import {
  gemstones,
  getGemstone,
  type Gemstone,
} from "@/data/gemstones";
import { site, waLink } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return gemstones.map((gem) => ({ slug: gem.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gem = getGemstone(slug);
  if (!gem) return { title: "Gemstone not found" };
  return {
    title: `${gem.name} — ${gem.weight}`,
    description: `${gem.name} (${gem.reference}), ${gem.colour}, ${gem.cut} cut, ${gem.weight}. Enquire with K Gems International about availability, documentation and a private quotation.`,
    alternates: { canonical: `/collection/${gem.slug}` },
    openGraph: {
      title: `${gem.name} — K Gems International`,
      description: `${gem.colour} ${gem.cut.toLowerCase()} cut, ${gem.weight}. ${gem.origin}.`,
      url: `/collection/${gem.slug}`,
    },
  };
}

function SpecRow({
  label,
  value,
  status,
  mono = false,
}: {
  label: string;
  value: string;
  status?: "confirmed" | "unconfirmed";
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-ivory/10 py-3.5">
      <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-ivory/38">
        {label}
      </dt>
      <dd
        className={`flex items-center gap-2 text-right text-[0.82rem] text-ivory/80 ${mono ? "font-mono-ref" : ""}`}
      >
        {status === "unconfirmed" && (
          <span
            className="h-1 w-1 rounded-full bg-ivory/30"
            aria-hidden
          />
        )}
        {value}
      </dd>
    </div>
  );
}

function RelatedStones({ current }: { current: Gemstone }) {
  const related = gemstones.filter((gem) => gem.slug !== current.slug).slice(0, 3);
  return (
    <section className="container-luxe pb-24 pt-16" aria-labelledby="related-heading">
      <div className="flex items-end justify-between gap-6 border-t border-gold/15 pt-10">
        <div>
          <p className="eyebrow">Continue Exploring</p>
          <h2
            id="related-heading"
            className="display mt-3 text-[clamp(2rem,3.4vw,2.8rem)] text-ivory"
          >
            Other stones to consider.
          </h2>
        </div>
        <Link
          href="/#collection"
          className="link-underline hidden shrink-0 sm:inline-flex"
        >
          All stones
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((gem) => (
          <Link
            key={gem.slug}
            href={`/collection/${gem.slug}`}
            className="group flex items-center gap-5 border border-ivory/10 bg-[#08131f] p-4 transition-colors hover:border-gold/40"
          >
            <div className="h-24 w-20 shrink-0 overflow-hidden border border-gold/15 bg-[#050c15]">
              <GemModelPreview gem={gem} className="h-full w-full" allowRetry={false} />
            </div>
            <div className="min-w-0">
              <p className="text-[0.52rem] uppercase tracking-[0.2em] text-gold/70">
                {gem.family}
              </p>
              <p className="mt-1 truncate font-serif text-[1.25rem] text-ivory group-hover:text-gold-soft">
                {gem.name}
              </p>
              <p className="mt-1 text-[0.65rem] text-ivory/38">
                {gem.weight} · {gem.cut} cut
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Static placeholder shown while the URL params stream into the shell. */
function GemstonePageFallback() {
  return (
    <div
      className="container-luxe pt-28 sm:pt-32"
      role="status"
    >
      <span className="sr-only">Loading gemstone…</span>
      <div
        className="mt-8 grid gap-10 pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16"
        aria-hidden
      >
        <div className="aspect-[4/5] w-full animate-pulse border border-gold/20 bg-[#0b1a2b] motion-reduce:animate-none" />
        <div className="space-y-4 lg:pt-2">
          <div className="h-4 w-28 animate-pulse bg-ivory/10 motion-reduce:animate-none" />
          <div className="h-12 w-3/4 animate-pulse bg-ivory/10 motion-reduce:animate-none" />
          <div className="h-4 w-1/2 animate-pulse bg-ivory/[0.07] motion-reduce:animate-none" />
          <div className="mt-6 h-56 w-full animate-pulse bg-ivory/[0.05] motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}

export default function GemstonePage({ params }: Props) {
  return (
    <div className="bg-ink">
      <Suspense fallback={<GemstonePageFallback />}>
        <GemstoneContent params={params} />
      </Suspense>
    </div>
  );
}

async function GemstoneContent({ params }: Props) {
  const { slug } = await params;
  const gem = getGemstone(slug);
  if (!gem) notFound();

  const enquiryHref = `/enquiry?stone=${encodeURIComponent(gem.reference)}`;
  const whatsapp = waLink(
    `Hello ${site.name}, I would like to enquire about the ${gem.name} (${gem.reference}, ${gem.weight}) listed on your website.`,
  );

  return (
    <>
      <div className="container-luxe pt-28 sm:pt-32">
        <nav aria-label="Breadcrumb" className="text-[0.6rem] tracking-[0.16em] text-ivory/35">
          <ol className="flex flex-wrap items-center gap-2.5">
            <li>
              <Link href="/" className="transition-colors hover:text-gold-soft">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href="/#collection"
                className="transition-colors hover:text-gold-soft"
              >
                Collection
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ivory/60">{gem.name}</li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <GemDetailVisual gem={gem} />
          </div>

          <div className="lg:pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">{gem.family}</p>
              <span
                className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[0.52rem] uppercase tracking-[0.18em] ${
                  gem.status === "Available"
                    ? "border-gold/40 text-gold-soft"
                    : "border-ivory/20 text-ivory/45"
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
            </div>
            <h1 className="display mt-5 text-[clamp(2.9rem,5.2vw,4.6rem)] text-ivory">
              {gem.name}
            </h1>
            <p className="mt-3 text-[0.72rem] uppercase tracking-[0.22em] text-gold/80">
              {gem.colour} · {gem.cut} cut · {gem.weight}
            </p>
            <p className="mt-6 max-w-xl text-[0.93rem] leading-[1.85] text-ivory/58">
              {gem.blurb}
            </p>

            <dl className="mt-9">
              <SpecRow label="Reference" value={gem.reference} mono />
              <SpecRow label="Carat weight" value={gem.weight} />
              <SpecRow label="Colour" value={gem.colour} />
              <SpecRow label="Cut" value={gem.cut} />
              <SpecRow label="Known origin" value={gem.origin} />
              <SpecRow
                label="Treatment"
                value={gem.treatment ?? "Not yet confirmed"}
                status={gem.treatment ? "confirmed" : "unconfirmed"}
              />
              <SpecRow
                label="Certification"
                value={gem.certification ?? "Not yet confirmed"}
                status={gem.certification ? "confirmed" : "unconfirmed"}
              />
              <SpecRow label="Availability" value={gem.status} />
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={enquiryHref} className="btn btn--solid">
                Request a Quotation
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                WhatsApp Enquiry
              </a>
            </div>

            <div className="mt-8 border border-gold/15 bg-[#08131f] p-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" aria-hidden />
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-gold/80">
                    Demonstration listing
                  </p>
                  <p className="mt-2 text-[0.76rem] leading-relaxed text-ivory/45">
                    Reference numbers, specifications and availability shown here
                    are demonstration content pending verification against
                    current inventory. Treatment, certification and origin
                    details are confirmed for each individual stone before any
                    transaction.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="border border-ivory/10 p-4">
                <BadgeCheck className="h-4 w-4 text-gold/75" aria-hidden />
                <p className="mt-3 text-[0.62rem] uppercase tracking-[0.16em] text-ivory/62">
                  Documentation support
                </p>
                <p className="mt-1.5 text-[0.7rem] leading-relaxed text-ivory/35">
                  Independent laboratory reports where available and supplied.
                </p>
              </div>
              <div className="border border-ivory/10 p-4">
                <ShieldCheck className="h-4 w-4 text-gold/75" aria-hidden />
                <p className="mt-3 text-[0.62rem] uppercase tracking-[0.16em] text-ivory/62">
                  Private viewing
                </p>
                <p className="mt-1.5 text-[0.7rem] leading-relaxed text-ivory/35">
                  Arrange a viewing by appointment in Colombo or Oddamavadi.
                </p>
              </div>
            </div>

            <Link
              href="/#collection"
              className="mt-9 inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-ivory/38 transition-colors hover:text-gold-soft"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back to the collection
            </Link>
          </div>
        </div>
      </div>
      <RelatedStones current={gem} />
    </>
  );
}
