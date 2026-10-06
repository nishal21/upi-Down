import type { MetadataRoute } from "next";
import { BANKS } from "@upi-down/shared";
import { bankSlug, SITE_URL } from "@/lib/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "always",
      priority: 1,
    },
    ...BANKS.map((b) => ({
      url: `${SITE_URL}/${bankSlug(b.id)}/`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: b.tier === 1 ? 0.95 : b.tier === 2 ? 0.8 : b.tier === 3 ? 0.65 : 0.5,
    })),
    {
      url: `${SITE_URL}/about/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${SITE_URL}/privacy/`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.25,
    },
  ];
}
