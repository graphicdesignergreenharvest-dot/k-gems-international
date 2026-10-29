"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import BrandMark from "./BrandMark";
import { navigation, site, telLink, waLink } from "@/lib/site";

const sectionIds = navigation.map((item) => item.section);

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: [0, 0.2, 0.5] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome, pathname]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMenuOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      const firstLink = menuRef.current?.querySelector<HTMLElement>("a,button");
      firstLink?.focus({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = scrolled || !isHome;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-[background-color,border-color,backdrop-filter] duration-700 ${
          solid
            ? "border-b border-gold/15 bg-[#071525]/88 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-luxe flex h-[4.6rem] items-center justify-between gap-6 lg:h-[5.2rem]">
          <BrandMark compact className="relative z-[2]" priority />

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 xl:flex"
          >
            {navigation.map((item) => {
              const isActive = isHome && active === item.section && scrolled;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative py-2 text-[0.85rem] uppercase tracking-[0.17em] transition-colors duration-300 ${
                    isActive
                      ? "text-gold-soft"
                      : "text-ivory/65 hover:text-ivory"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-500 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* Wrapper hides the button on small screens: `.btn` sets display in unlayered CSS and would override a `hidden` utility on the link itself. */}
            <div className="hidden sm:block">
              <Link href="/#enquiry" className="btn btn--solid btn--sm">
                Request a Gemstone
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="flex h-11 w-11 items-center justify-center border border-gold/25 text-gold transition-colors hover:border-gold/60 xl:hidden"
            >
              <span className="sr-only">
                {menuOpen ? "Close navigation" : "Open navigation"}
              </span>
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
        <div
          aria-hidden
          className={`h-px origin-left bg-gradient-to-r from-transparent via-gold/50 to-transparent transition-transform duration-700 ${
            solid ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </header>

      {/* Mobile navigation */}
      <div
        id="mobile-navigation"
        ref={menuRef}
        aria-hidden={!menuOpen}
        // `inert` prevents keyboard focus reaching hidden links in browsers that
        // support the attribute; aria-hidden handles the announcement layer.
        {...(!menuOpen ? { inert: true } : {})}
        className={`fixed inset-0 z-[59] bg-[#061019] transition-[opacity,visibility] duration-500 xl:hidden ${
          menuOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -right-32 top-0 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(30,77,160,0.28),transparent_65%)]" />
          <div className="absolute -left-20 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.14),transparent_65%)]" />
        </div>
        <div className="relative flex h-full flex-col overflow-y-auto px-6 pb-10 pt-28 sm:px-10">
          <nav aria-label="Mobile navigation" className="flex flex-col">
            {navigation.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="group flex items-baseline justify-between border-b border-ivory/10 py-4 transition-colors hover:text-gold-soft"
              >
                <span className="font-serif text-[clamp(1.9rem,8vw,2.6rem)] leading-tight">
                  {item.label}
                </span>
                <span className="text-[0.8rem] tracking-[0.25em] text-gold/60">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-10">
            <Link
              href="/#enquiry"
              onClick={() => setMenuOpen(false)}
              className="btn btn--solid w-full"
            >
              Request a Gemstone
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <div className="mt-6 flex flex-col gap-2 text-[0.78rem] text-ivory/58">
              <a href={telLink} className="hover:text-gold">
                {site.phoneDisplay}
              </a>
              <a href={`mailto:${site.email}`} className="break-all hover:text-gold">
                {site.email}
              </a>
              <a
                href={waLink("Hello K Gems International, I would like to enquire about a gemstone.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-gold"
              >
                WhatsApp our team
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
