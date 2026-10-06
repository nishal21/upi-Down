import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BANKS, BANK_BY_ID } from "@upi-down/shared";
import { BankPage } from "@/components/bank-page";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL, bankSlug } from "@/lib/config";
import { absoluteUrl, bankFaq, bankKeywords } from "@/lib/seo";

/** Unknown bank URLs 404. With static export this only applies in `next build` / hosting. */
export const dynamicParams = false;

export function generateStaticParams() {
  return BANKS.map((b) => ({ slug: bankSlug(b.id) }));
}

function bankFromSlug(slug: string) {
  return BANK_BY_ID[slug.replace(/-upi-down$/, "")];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const bank = bankFromSlug((await params).slug);
  if (!bank) return { title: "Page not found", robots: { index: false } };
  const path = `/${bankSlug(bank.id)}/`;
  const title = `Is ${bank.short} UPI down right now? Live ${bank.name} status`;
  const description = `${bank.name} (${bank.short}) UPI not working? See live Down / Slow / Working status from user reports in the last 15 minutes, compare with other banks, and report a failed payment. Free, no login.`;
  return {
    title,
    description,
    keywords: bankKeywords(bank),
    alternates: { canonical: path },
    openGraph: {
      title: `Is ${bank.short} UPI down today?`,
      description,
      url: path,
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${bank.short} UPI status on UPI Down?` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Is ${bank.short} UPI down?`,
      description,
      images: ["/og.png"],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const bank = bankFromSlug((await params).slug);
  if (!bank) notFound();

  const path = `/${bankSlug(bank.id)}/`;
  const faq = bankFaq(bank);
  const others = BANKS.filter((b) => b.id !== bank.id && b.tier === 1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: `${bank.short} UPI status`, item: absoluteUrl(path) },
        ],
      },
      {
        "@type": "WebPage",
        "@id": absoluteUrl(`${path}#webpage`),
        url: absoluteUrl(path),
        name: `Is ${bank.short} UPI down right now?`,
        description: `Live ${bank.name} UPI status from user reports.`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: {
          "@type": "Organization",
          name: bank.name,
          alternateName: bank.short,
        },
        inLanguage: "en-IN",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "#bank-answer"],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:pt-12">
      <div className="web-seo">
        <JsonLd data={jsonLd} />
      </div>
      <nav aria-label="Breadcrumb" className="board-label web-seo">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-base-content">
              All banks
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-base-content">{bank.short}</li>
        </ol>
      </nav>
      <h1 className="mt-3 font-display text-[clamp(2rem,6vw,3.25rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-balance">
        Is {bank.short} UPI down right now?
      </h1>
      <p id="bank-answer" className="web-seo mt-3 max-w-[55ch] text-[17px] leading-relaxed text-muted-foreground">
        Live {bank.name} UPI status from anonymous failed-payment reports in the last 15 minutes. Not from NPCI or{" "}
        {bank.name}.
      </p>

      <div className="mt-8 rounded-[4px] border border-base-300 p-5">
        <BankPage bankId={bank.id} />
      </div>

      <section className="web-seo mt-12 space-y-6" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display text-2xl font-bold">
          {bank.short} UPI questions
        </h2>
        {faq.map((f) => (
          <div key={f.q}>
            <h3 className="font-display text-xl font-bold">{f.q}</h3>
            <p className="mt-1.5 leading-relaxed text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </section>

      <nav className="web-seo mt-12" aria-label="Other banks">
        <p className="board-label mb-3">Check other banks</p>
        <ul className="flex flex-wrap gap-2">
          {others.map((b) => (
            <li key={b.id}>
              <Link
                href={`/${bankSlug(b.id)}/`}
                className="badge h-9 rounded-[3px] border-base-300 px-3 font-mono text-xs font-bold hover:border-base-content"
              >
                {b.short}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
