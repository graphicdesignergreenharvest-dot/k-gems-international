"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page] unhandled error", error);
  }, [error]);

  return (
    <div className="flex min-h-[75svh] items-center bg-ink pb-20 pt-28">
      <div className="container-luxe">
        <p className="eyebrow">Something interrupted</p>
        <h1 className="display mt-6 max-w-2xl text-[clamp(2.8rem,6vw,5rem)] text-ivory">
          We could not complete
          <br />
          <span className="italic text-gold-soft/90">that request.</span>
        </h1>
        <p className="mt-6 max-w-md text-[0.9rem] leading-[1.85] text-ivory/52">
          Please try again. If the problem continues, contact our team on
          WhatsApp or by email and we will help personally.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn--solid">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Try again
          </button>
          <Link href="/" className="btn btn--ghost">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
