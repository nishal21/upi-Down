import Link from "next/link";
import { homeFaq, majorBankLinks } from "@/lib/seo";
import { JsonLd } from "./json-ld";

/** Crawlable answer content for Google, AI overviews and answer engines. */
export function HomeSeo() {
  const faq = homeFaq();
  const banks = majorBankLinks();

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-12" aria-labelledby="seo-heading">
      <JsonLd data={faqLd} />

      <h2 id="seo-heading" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        How to check if UPI is down
      </h2>
      <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted-foreground">
        UPI Down? shows live status for Indian banks and UPI apps from anonymous failed-payment reports in the last 15
        minutes. It is free, needs no login, and is not affiliated with NPCI or any bank. Use it when a payment fails and
        you want to know whether to try another bank or wait.
      </p>

      <ol className="mt-8 max-w-[60ch] list-decimal space-y-3 ps-5 text-[15px] leading-relaxed">
        <li>Search your bank or open it from the board above.</li>
        <li>Read Down, Slow, Working or No info from recent reports.</li>
        <li>If your payment failed, tap report so others see it too.</li>
        <li>If only one app fails, try the same bank in a different UPI app.</li>
      </ol>

      <h3 className="mt-12 font-display text-2xl font-bold">Major banks</h3>
      <p className="mt-2 max-w-[55ch] text-sm text-muted-foreground">
        Direct pages for the banks people check most when UPI fails.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {banks.map((b) => (
          <li key={b.href}>
            <Link
              href={b.href}
              className="flex h-11 items-center justify-between gap-3 rounded-[3px] border border-base-300 px-3 text-sm hover:border-base-content"
            >
              <span className="truncate font-medium">{b.name}</span>
              <span className="shrink-0 font-mono text-xs font-bold text-muted-foreground">{b.short}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h3 className="mt-12 font-display text-2xl font-bold">Common questions</h3>
      <dl className="mt-6 max-w-[64ch] space-y-6">
        {faq.map((f) => (
          <div key={f.q}>
            <dt className="font-display text-lg font-bold">{f.q}</dt>
            <dd className="mt-1.5 leading-relaxed text-muted-foreground">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
