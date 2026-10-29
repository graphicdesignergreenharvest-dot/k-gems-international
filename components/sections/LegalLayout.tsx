import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export default function LegalLayout({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-ink">
      <div className="container-luxe pb-24 pt-32 sm:pt-40">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[0.8rem] uppercase tracking-[0.2em] text-ivory/62 transition-colors hover:text-gold-soft"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to K Gems International
        </Link>

        <div className="mt-10 grid gap-10 border-t border-gold/18 pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display mt-6 text-[clamp(2.8rem,5.4vw,4.6rem)] text-ivory">
              {title}
            </h1>
            <p className="mt-6 max-w-sm text-[0.86rem] leading-relaxed text-ivory/72">
              {intro}
            </p>
            <p className="mt-6 text-[0.8rem] uppercase tracking-[0.18em] text-ivory/62">
              Last updated {updated}
            </p>
          </div>
          <div className="max-w-2xl space-y-9">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`legal-${number}`}>
      <div className="flex items-baseline gap-4 border-t border-gold/15 pt-6">
        <span className="font-serif text-[0.95rem] text-gold/55">{number}</span>
        <h2
          id={`legal-${number}`}
          className="font-serif text-[1.55rem] text-ivory"
        >
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-3 pl-0 text-[0.84rem] leading-[1.9] text-ivory/50 sm:pl-8">
        {children}
      </div>
    </section>
  );
}
