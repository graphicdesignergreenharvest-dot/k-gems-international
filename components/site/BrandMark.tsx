import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  href?: string;
  badgeClassName?: string;
  priority?: boolean;
};

export default function BrandMark({
  className = "",
  compact = false,
  href = "/#home",
  badgeClassName = "h-11 w-11",
  priority = false,
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3.5 ${className}`}
      aria-label="K Gems International — home"
    >
      <Image
        src="/brand/k-gems-badge.webp"
        alt=""
        width={768}
        height={768}
        priority={priority}
        sizes="64px"
        className={`${badgeClassName} shrink-0 object-contain drop-shadow-[0_2px_12px_rgba(4,12,24,0.45)] transition-transform duration-700 group-hover:scale-[1.04]`}
      />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.42rem] font-normal tracking-[0.08em] text-ivory">
          K GEMS
          {!compact && (
            <span className="ml-1.5 text-[0.8rem] tracking-[0.2em] text-gold">
              INTERNATIONAL
            </span>
          )}
        </span>
        {compact && (
          <span className="mt-1 text-[0.72rem] uppercase tracking-[0.42em] text-gold/80">
            International
          </span>
        )}
      </span>
    </Link>
  );
}
