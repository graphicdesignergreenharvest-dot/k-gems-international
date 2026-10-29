import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import EnquiryForm from "./EnquiryForm";
import Reveal from "@/components/ui/Reveal";
import { mailLink, site, telLink, waLink } from "@/lib/site";

const steps = [
  {
    title: "We read your note",
    copy: "Your requirements are reviewed personally, not processed as a generic request.",
  },
  {
    title: "We respond with options",
    copy: "Where suitable stones are available, we share details and documentation for your consideration.",
  },
  {
    title: "We arrange a viewing",
    copy: "If appropriate, we arrange a private appointment in Colombo or Oddamavadi.",
  },
];

export default function EnquirySection({
  defaultStone,
  pageHeading = false,
}: {
  defaultStone?: string;
  pageHeading?: boolean;
}) {
  return (
    <section
      id="enquiry"
      className="relative overflow-hidden bg-ink"
      aria-labelledby="enquiry-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-52 top-10 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(33,78,154,0.2),transparent_66%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.1),transparent_68%)]"
      />
      <div
        className={`container-luxe relative section ${
          pageHeading ? "!pt-28 sm:!pt-32" : ""
        }`}
      >
        <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="eyebrow">Private Enquiries</p>
              <h2
                id="enquiry-heading"
                className="display mt-6 text-[clamp(2.7rem,5vw,4.6rem)] text-ivory"
              >
                Tell Us What
                <br />
                <span className="italic text-gold-soft/92">You Are Looking For.</span>
              </h2>
              <p className="prose-luxe mt-6 max-w-md">
                Ask about a listed gemstone or describe the colour, size, and
                budget you have in mind. Our team will contact you directly.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <a
                  href={waLink(
                    "Hello K Gems International, I would like to make a private gemstone enquiry.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 border border-gold/18 bg-white/[0.02] p-4 transition-colors hover:border-gold/45"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" aria-hidden />
                  <span>
                    <span className="block text-[0.72rem] uppercase tracking-[0.2em] text-gold/75">
                      WhatsApp
                    </span>
                    <span className="mt-1 block text-[0.82rem] text-ivory/65 group-hover:text-ivory">
                      {site.phoneDisplay}
                    </span>
                  </span>
                </a>
                <a
                  href={mailLink("Private gemstone enquiry")}
                  className="group flex items-start gap-3 border border-gold/18 bg-white/[0.02] p-4 transition-colors hover:border-gold/45"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[0.72rem] uppercase tracking-[0.2em] text-gold/75">
                      Email
                    </span>
                    <span className="mt-1 block break-all text-[0.82rem] text-ivory/65 group-hover:text-ivory">
                      {site.email}
                    </span>
                  </span>
                </a>
                <a
                  href={telLink}
                  className="group flex items-start gap-3 border border-gold/18 bg-white/[0.02] p-4 transition-colors hover:border-gold/45"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" aria-hidden />
                  <span>
                    <span className="block text-[0.72rem] uppercase tracking-[0.2em] text-gold/75">
                      Telephone
                    </span>
                    <span className="mt-1 block text-[0.82rem] text-ivory/65 group-hover:text-ivory">
                      Call our team
                    </span>
                  </span>
                </a>
                <Link
                  href="/#contact"
                  className="group flex items-start gap-3 border border-gold/18 bg-white/[0.02] p-4 transition-colors hover:border-gold/45"
                >
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" aria-hidden />
                  <span>
                    <span className="block text-[0.72rem] uppercase tracking-[0.2em] text-gold/75">
                      Private viewing
                    </span>
                    <span className="mt-1 block text-[0.82rem] text-ivory/65 group-hover:text-ivory">
                      Colombo or Oddamavadi
                    </span>
                  </span>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <ol className="mt-10 space-y-5 border-t border-gold/15 pt-7">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="mt-0.5 font-serif text-[1.05rem] text-gold/55">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-[0.8rem] uppercase tracking-[0.16em] text-ivory/70">
                        {step.title}
                      </p>
                      <p className="mt-1 max-w-sm text-[0.76rem] leading-relaxed text-ivory/62">
                        {step.copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <EnquiryForm defaultStone={defaultStone} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
