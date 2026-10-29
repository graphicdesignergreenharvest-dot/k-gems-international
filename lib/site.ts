export const site = {
  name: "K Gems International",
  legalName: "K Gems International (Pvt) Ltd",
  registration: "PV 00330893",
  shortName: "K Gems",
  tagline: "Pure Brilliance in Every Stone.",
  description:
    "K Gems International connects collectors, jewellers and private clients with distinctive Sri Lankan and international gemstones, with clear information on origin, treatment and certification where available.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kgemsinternational.com",
  email: "kiyasmohamed2012@gmail.com",
  phoneDisplay: "+94 77 737 8592",
  phoneHref: "+94777378592",
  whatsappNumber: "94777378592",
} as const;

export const locations = [
  {
    id: "colombo",
    label: "Head Office",
    lines: [
      "K Gems International",
      "199 2/1, Galle Road",
      "Colombo 03, Sri Lanka",
    ],
    plusCode: "WR7X+4P Colombo",
    mapsQuery: "199 2/1 Galle Road, Colombo 03, Sri Lanka",
  },
  {
    id: "oddamavadi",
    label: "Branch",
    lines: ["Oddamavadi", "Sri Lanka"],
    plusCode: "WG5J+V9 Oddamavadi",
    mapsQuery: "Oddamavadi, Sri Lanka",
  },
] as const;

export const navigation = [
  { label: "Home", href: "/#home", section: "home" },
  { label: "Our Journey", href: "/#journey", section: "journey" },
  { label: "Collection", href: "/#collection", section: "collection" },
  { label: "About", href: "/#about", section: "about" },
  { label: "Certificates & Trust", href: "/#trust", section: "trust" },
  { label: "Contact", href: "/#contact", section: "contact" },
] as const;

export const waLink = (message?: string) =>
  `https://wa.me/${site.whatsappNumber}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

export const mailLink = (subject?: string) =>
  `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

export const mapsLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const telLink = `tel:${site.phoneHref}`;
