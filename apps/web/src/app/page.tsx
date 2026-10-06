import type { Metadata } from "next";
import { AppHome } from "@/components/app-home";
import { HomeSeo } from "@/components/home-seo";
import { JsonLd } from "@/components/json-ld";
import { WebOnly } from "@/components/web-only";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  HOME_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  jsonLdGraph,
  ogImages,
  twitterImages,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: DEFAULT_DESCRIPTION,
  keywords: HOME_KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Is UPI down right now? Live bank status",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: ogImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Is UPI down right now?",
    description: DEFAULT_DESCRIPTION,
    images: twitterImages(),
  },
};

const webAppLd = jsonLdGraph([
  {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "UPI Down?",
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#app`,
    name: "UPI Down?",
    url: SITE_URL,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Android, Web",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    audience: { "@type": "Audience", geographicArea: { "@type": "Country", name: "India" } },
  },
  {
    "@type": "Organization",
    "@id": `${SITE_URL}/#org`,
    name: "UPI Down?",
    url: SITE_URL,
    logo: absoluteUrl("/icons/icon-512.png"),
  },
  {
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: "Is UPI down right now?",
    description: DEFAULT_DESCRIPTION,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#org` },
    inLanguage: "en-IN",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#seo-heading"],
    },
  },
]);

export default function Page() {
  return (
    <>
      <WebOnly>
        <JsonLd data={webAppLd} />
      </WebOnly>
      <AppHome />
      <WebOnly>
        <HomeSeo />
      </WebOnly>
    </>
  );
}
