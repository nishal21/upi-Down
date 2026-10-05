import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BANKS, BANK_BY_ID } from "@upi-down/shared";
import { BankPage } from "@/components/bank-page";
import { bankSlug } from "@/lib/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return BANKS.map((b) => ({ slug: bankSlug(b.id) }));
}

function bankFromSlug(slug: string) {
  return BANK_BY_ID[slug.replace(/-upi-down$/, "")];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const bank = bankFromSlug((await params).slug);
  if (!bank) return {};
  const title = `Is ${bank.short} UPI down right now? Live ${bank.name} status`;
  const description = `${bank.name} UPI not working? Check live reports from other users in the last 15 minutes, see if it's the bank or just you, and report a failed payment. No login.`;
  return {
    title,
    description,
    alternates: { canonical: `/${bankSlug(bank.id)}/` },
    openGraph: {
      title: `Is ${bank.short} UPI down?`,
      description,
      url: `/${bankSlug(bank.id)}/`,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const bank = bankFromSlug((await params).slug);
  if (!bank) notFound();

  const faq = [
    {
      q: `How do I know if ${bank.short} UPI is down?`,
      a: `When many people report failed ${bank.short} UPI payments within 15 minutes, this page marks ${bank.short} as down. If there are few or no reports, the problem is more likely your app, network or phone.`,
    },
    {
      q: `My ${bank.short} UPI payment failed but money was debited. What now?`,
      a: `Failed UPI debits are usually reversed automatically, often within 24–48 hours. Keep the UPI transaction ID and raise a complaint in your UPI app or with ${bank.name} if it is not reversed.`,
    },
    {
      q: "Is this official?",
      a: "No. Status comes only from recent reports by users. It is not from NPCI, any bank or any UPI app.",
    },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const others = BANKS.filter((b) => b.id !== bank.id && b.tier === 1);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="board-label">
        <Link href="/" className="hover:text-base-content">
          ← All banks
        </Link>
      </p>
      <h1 className="mt-3 font-display text-[clamp(2rem,6vw,3.25rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-balance">
        Is {bank.short} UPI down right now?
      </h1>

      <div className="mt-8 rounded-[4px] border border-base-300 p-5">
        <BankPage bankId={bank.id} />
      </div>

      <section className="mt-12 space-y-6">
        {faq.map((f) => (
          <div key={f.q}>
            <h2 className="font-display text-xl font-bold">{f.q}</h2>
            <p className="mt-1.5 leading-relaxed text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </section>

      <nav className="mt-12" aria-label="Other banks">
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
