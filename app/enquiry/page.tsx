import type { Metadata } from "next";
import { Suspense } from "react";
import EnquirySection from "@/components/enquiry/EnquirySection";
import { gemstones } from "@/data/gemstones";

export const metadata: Metadata = {
  title: "Private Gemstone Enquiry",
  description:
    "Ask K Gems International about a listed gemstone, or describe the colour, size and budget you have in mind. Private, confidential enquiries with no obligation.",
  alternates: { canonical: "/enquiry" },
};

type Props = {
  searchParams: Promise<{ stone?: string | string[] }>;
};

async function EnquiryWithStone({ searchParams }: Props) {
  const params = await searchParams;
  const raw = Array.isArray(params.stone) ? params.stone[0] : params.stone;
  const stone = gemstones.find((gem) => gem.reference === raw)?.reference;

  return <EnquirySection defaultStone={stone} pageHeading />;
}

export default function EnquiryPage({ searchParams }: Props) {
  return (
    <div className="bg-ink">
      <Suspense fallback={<EnquirySection pageHeading />}>
        <EnquiryWithStone searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
