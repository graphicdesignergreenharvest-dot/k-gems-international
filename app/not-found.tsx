import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80svh] items-center overflow-hidden bg-ink pb-20 pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(33,78,154,0.22),transparent_62%)]"
      />
      <div className="container-luxe relative grid items-center gap-10 lg:grid-cols-[1fr_0.6fr]">
        <div>
          <p className="eyebrow">Page not found</p>
          <h1 className="display mt-6 text-[clamp(3rem,7vw,6rem)] text-ivory">
            This stone is
            <br />
            <span className="italic text-gold-soft/90">not in the case.</span>
          </h1>
          <p className="mt-6 max-w-md text-[0.9rem] leading-[1.85] text-ivory/52">
            The page you are looking for may have moved, or the link may be out
            of date. Return to the collection, or tell us what you are looking
            for and we will help.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#collection" className="btn btn--solid">
              Explore the Collection
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link href="/enquiry" className="btn btn--ghost">
              Make an Enquiry
            </Link>
          </div>
        </div>
        <div className="mx-auto w-44 sm:w-56">
          <Image
            src="/brand/k-gems-badge.webp"
            alt="K Gems International logo"
            width={768}
            height={768}
            sizes="224px"
            className="h-auto w-full drop-shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>
    </div>
  );
}
