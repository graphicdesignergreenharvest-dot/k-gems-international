import type { Metadata } from "next";
import Hero from "@/components/hero/Hero";
import SelectionExperience from "@/components/hero/SelectionExperience";
import Journey from "@/components/journey/Journey";
import Collection from "@/components/collection/Collection";
import About from "@/components/sections/About";
import Certificates from "@/components/sections/Certificates";
import InvestmentCalculator from "@/components/investment/InvestmentCalculator";
import EnquirySection from "@/components/enquiry/EnquirySection";
import Contact from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "K Gems International — Rare Beauty. Lasting Value.",
  description:
    "Discover exceptional gemstones with K Gems International: Ceylon sapphire, ruby, emerald, padparadscha and spinel. From earth to elegance, with clear origin, treatment and certification information where available.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectionExperience />
      <Collection />
      <Journey />
      <About />
      <Certificates />
      <InvestmentCalculator />
      <EnquirySection />
      <Contact />
    </>
  );
}
