import type { Metadata } from "next";
import Collection from "@/components/collection/Collection";

export const metadata: Metadata = {
  title: "The Collection — Fine Gemstones",
  description:
    "Explore the K Gems International gemstone collection: Ceylon sapphire, ruby, emerald, padparadscha, yellow sapphire and spinel. Enquire about availability, documentation and private quotations.",
  alternates: { canonical: "/collection" },
};

export default function CollectionPage() {
  return (
    <div className="bg-ivory pt-20">
      <Collection />
    </div>
  );
}
