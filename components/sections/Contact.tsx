import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { locations, mailLink, mapsLink, site, telLink, waLink } from "@/lib/site";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#050d16]"
      aria-labelledby="contact-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
      />
      <div className="container-luxe relative section">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end lg:gap-20">
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h2
              id="contact-heading"
              className="display mt-6 max-w-2xl text-[clamp(2.7rem,5.2vw,4.7rem)] text-ivory"
            >
              Two Places to
              <br />
              <span className="italic text-gold-soft/92">Meet the Stones.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-[0.9rem] leading-[1.85] text-ivory/52">
              Visit our head office in Colombo or our branch in Oddamavadi.
              Private viewings can be arranged by appointment through our team.
            </p>
            <Link href="/#enquiry" className="link-underline mt-5 inline-flex">
              Request a private viewing
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {locations.map((location, index) => (
            <Reveal key={location.id} delay={index * 0.08}>
              <article className="group relative flex h-full flex-col overflow-hidden border border-gold/20 bg-[#08131f] p-7 transition-colors duration-500 hover:border-gold/50 sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.12),transparent_68%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-gold/80">
                    {location.label}
                  </p>
                  <span className="font-serif text-[1.35rem] text-gold/30">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-[clamp(1.7rem,2.6vw,2.2rem)] leading-tight text-ivory">
                  {location.lines.slice(-2).join(", ")}
                </h3>
                <address className="mt-3 not-italic text-[0.84rem] leading-relaxed text-ivory/72">
                  {location.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <span className="mt-3 inline-flex items-center gap-2 border border-ivory/10 px-2.5 py-1.5 text-[0.8rem] tracking-[0.12em] text-ivory/72">
                    <MapPin className="h-3 w-3 text-gold/70" aria-hidden />
                    Plus Code {location.plusCode}
                  </span>
                </address>
                <div className="mt-7 flex items-center justify-between gap-4 border-t border-gold/12 pt-5">
                  <a
                    href={mapsLink(location.mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[0.8rem] uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-soft"
                  >
                    Get directions
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-ivory/62">
                    Sri Lanka
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-6 grid border border-gold/15 bg-white/[0.02] sm:grid-cols-2 lg:grid-cols-4">
            <a
              href={telLink}
              className="group flex items-center gap-3 border-b border-gold/12 p-5 transition-colors hover:bg-gold/[0.04] sm:border-r lg:border-b-0"
            >
              <Phone className="h-4 w-4 shrink-0 text-gold/75" aria-hidden />
              <span>
                <span className="block text-[0.72rem] uppercase tracking-[0.2em] text-ivory/62">
                  Call
                </span>
                <span className="mt-1 block text-[0.8rem] text-ivory/70 group-hover:text-ivory">
                  {site.phoneDisplay}
                </span>
              </span>
            </a>
            <a
              href={waLink("Hello K Gems International, I would like to arrange a private viewing.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 border-b border-gold/12 p-5 transition-colors hover:bg-gold/[0.04] lg:border-b-0 lg:border-r"
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-gold/75" aria-hidden />
              <span>
                <span className="block text-[0.72rem] uppercase tracking-[0.2em] text-ivory/62">
                  WhatsApp
                </span>
                <span className="mt-1 block text-[0.8rem] text-ivory/70 group-hover:text-ivory">
                  Message our team
                </span>
              </span>
            </a>
            <a
              href={mailLink("Private viewing enquiry")}
              className="group flex items-center gap-3 border-b border-gold/12 p-5 transition-colors hover:bg-gold/[0.04] sm:border-b-0 sm:border-r"
            >
              <Mail className="h-4 w-4 shrink-0 text-gold/75" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[0.72rem] uppercase tracking-[0.2em] text-ivory/62">
                  Email
                </span>
                <span className="mt-1 block truncate text-[0.8rem] text-ivory/70 group-hover:text-ivory">
                  {site.email}
                </span>
              </span>
            </a>
            <Link
              href="/#enquiry"
              className="group flex items-center gap-3 p-5 transition-colors hover:bg-gold/[0.04]"
            >
              <ArrowUpRight className="h-4 w-4 shrink-0 text-gold/75" aria-hidden />
              <span>
                <span className="block text-[0.72rem] uppercase tracking-[0.2em] text-ivory/62">
                  Private enquiry
                </span>
                <span className="mt-1 block text-[0.8rem] text-ivory/70 group-hover:text-ivory">
                  Tell us what you seek
                </span>
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
