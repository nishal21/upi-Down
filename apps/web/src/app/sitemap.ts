import type { MetadataRoute } from "next";
import { BANKS } from "@upi-down/shared";
import { bankSlug, SITE_URL } from "@/lib/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "always", priority: 1 },
    ...BANKS.map((b) => ({
      url: `${SITE_URL}/${bankSlug(b.id)}/`,
      changeFrequency: "always" as const,
      priority: b.tier === 1 ? 0.9 : 0.7,
    })),
    { url: `${SITE_URL}/about/`, priority: 0.4 },
    { url: `${SITE_URL}/privacy/`, priority: 0.3 },
  ];
}
