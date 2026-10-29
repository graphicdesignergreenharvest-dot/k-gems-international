import type { MetadataRoute } from "next";
import { gemstones } from "@/data/gemstones";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const core: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/collection`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/enquiry`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const stones: MetadataRoute.Sitemap = gemstones.map((gem) => ({
    url: `${base}/collection/${gem.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...core, ...stones];
}
