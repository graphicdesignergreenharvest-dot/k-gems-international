import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { site } from "@/lib/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "K Gems International — Fine Gemstones from Sri Lanka",
    template: "%s | K Gems International",
  },
  description: site.description,
  keywords: [
    "Ceylon sapphire",
    "Sri Lankan gemstones",
    "fine gemstones",
    "padparadscha sapphire",
    "gemstone enquiry",
    "Colombo gemstones",
    "K Gems International",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: site.url,
    siteName: site.name,
    title: "K Gems International — Rare Beauty. Lasting Value.",
    description: site.description,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "K Gems International logo — Pure Brilliance in Every Stone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "K Gems International — Rare Beauty. Lasting Value.",
    description: site.description,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#071525",
  colorScheme: "dark",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: site.name,
  legalName: site.legalName,
  identifier: site.registration,
  url: site.url,
  description: site.description,
  email: site.email,
  telephone: site.phoneHref,
  image: `${site.url}/og.jpg`,
  logo: `${site.url}/brand/k-gems-badge.webp`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "199 2/1, Galle Road",
    addressLocality: "Colombo 03",
    addressCountry: "LK",
  },
  department: [
    {
      "@type": "JewelryStore",
      name: "K Gems International — Oddamavadi Branch",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Oddamavadi",
        addressCountry: "LK",
      },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink text-ivory">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
