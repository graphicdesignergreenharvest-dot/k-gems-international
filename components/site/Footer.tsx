import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import BrandMark from "./BrandMark";
import CurrentYear from "@/components/ui/CurrentYear";
import { locations, mailLink, mapsLink, site, telLink, waLink } from "@/lib/site";

const explore = [
  { label: "Home", href: "/#home" },
  { label: "Our Journey", href: "/#journey" },
  { label: "Collection", href: "/#collection" },
  { label: "About", href: "/#about" },
  { label: "Certificates & Trust", href: "/#trust" },
  { label: "Contact", href: "/#contact" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-gold/15 bg-[#050d16]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(27,82,184,0.14),transparent_65%)]"
      />
      <div className="container-luxe relative pb-10 pt-20 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_0.7fr_0.85fr_1fr]">
          <div>
            <BrandMark compact href="/#home" badgeClassName="h-14 w-14" />
            <p className="mt-7 max-w-sm text-[0.86rem] leading-[1.85] text-ivory/52">
              Distinctive gemstones, considered individually. K Gems
              International connects collectors, jewellers and private clients
              with stones selected through experienced evaluation and described
              with care.
            </p>
            <p className="mt-8 font-serif text-[1.5rem] italic leading-snug text-gold-soft/90">
              Pure Brilliance in Every Stone.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="eyebrow is-plain text-[0.72rem]">Explore</h2>
            <ul className="mt-6 space-y-3">
              {explore.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[0.82rem] text-ivory/55 transition-colors hover:text-gold-soft"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow is-plain text-[0.72rem]">Enquiries</h2>
            <ul className="mt-6 space-y-4 text-[0.82rem] text-ivory/55">
              <li>
                <a
                  href={telLink}
                  className="flex items-start gap-3 transition-colors hover:text-gold-soft"
                >
                  <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden />
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={mailLink("Gemstone enquiry — K Gems International")}
                  className="flex items-start gap-3 break-all transition-colors hover:text-gold-soft"
                >
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden />
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={waLink("Hello K Gems International, I would like to enquire about a gemstone.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition-colors hover:text-gold-soft"
                >
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden />
                  WhatsApp our team
                </a>
              </li>
              <li>
                <Link
                  href="/#enquiry"
                  className="flex items-start gap-3 text-gold-soft transition-colors hover:text-gold"
                >
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Request a private viewing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="eyebrow is-plain text-[0.72rem]">Locations</h2>
            <ul className="mt-6 space-y-5">
              {locations.map((location) => (
                <li key={location.id}>
                  <p className="text-[0.8rem] uppercase tracking-[0.22em] text-gold/70">
                    {location.label}
                  </p>
                  <a
                    href={mapsLink(location.mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 flex items-start gap-2 text-[0.8rem] leading-relaxed text-ivory/52 transition-colors hover:text-gold-soft"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/60" aria-hidden />
                    <span>
                      {location.lines.join(", ")}
                      <span className="mt-1 block text-[0.8rem] text-ivory/62">
                        {location.plusCode}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 h-px w-full bg-gradient-to-r from-gold/40 via-gold/15 to-transparent" />

        <div className="mt-7 flex flex-col gap-5 text-[0.8rem] text-ivory/62 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {site.legalName}. All rights reserved.{" "}
            <span className="text-ivory/62">Reg. {site.registration}</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-gold-soft">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-gold-soft">
              Terms and Conditions
            </Link>
            <Link href="/#contact" className="transition-colors hover:text-gold-soft">
              Contact
            </Link>
          </div>
        </div>
        <p className="mt-8 max-w-2xl text-[0.8rem] leading-relaxed text-ivory/62">
          Gemstone listings on this site are demonstration entries pending
          verification against current inventory. Origin, treatment and
          certification information is confirmed for each individual stone
          before any transaction.
        </p>
      </div>
    </footer>
  );
}
