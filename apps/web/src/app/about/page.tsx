import type { Metadata } from "next";
import { NPCI_SYNCED_AT } from "@upi-down/shared";
import { SITE_NAME, absoluteUrl, ogImages, twitterImages } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How UPI Down? works – status rules explained",
  description:
    "How UPI Down? turns anonymous failed-payment reports into Down, Slow, Working or No info for Indian banks. Crowd-sourced, not NPCI official data.",
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "How UPI Down? works",
    description: "Status rules for Down, Slow, Working and No info from user reports.",
    url: absoluteUrl("/about/"),
    type: "website",
    siteName: SITE_NAME,
    images: ogImages("How UPI Down? status rules work"),
  },
  twitter: {
    card: "summary_large_image",
    title: "How UPI Down? works",
    description: "Status rules for Down, Slow, Working and No info from user reports.",
    images: twitterImages(),
  },
  keywords: ["how to check if upi is down", "upi status explained", "upi down meaning"],
};

const rows = [
  ["Down", "text-down", "15+ reports in 15 min, at least 5× the usual for this hour, mostly outright failures."],
  ["Slow", "text-slow", "6+ reports in 15 min and at least 2.5× the usual."],
  ["Working", "text-ok", "Few or no reports, and the bank has had reports before."],
  ["No info", "text-unknown", "No reports yet. We don't guess."],
];

export default function About() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-10 leading-relaxed">
      <h1 className="font-display text-4xl font-extrabold">How UPI Down? works</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        When a UPI payment fails, you can&apos;t tell if it&apos;s the bank, the app or your phone. UPI Down? asks everyone
        the same question and shows the answer live for banks across India.
      </p>

      <ol className="mt-8 space-y-4 font-mono text-sm">
        <li>
          <b>01</b> · Someone taps “Payment failed on this bank”.
        </li>
        <li>
          <b>02</b> · We count reports per bank over the last 15 minutes and compare with what's normal for that hour.
        </li>
        <li>
          <b>03</b> · If many people fail on one bank, that bank looks down. If one app fails across many banks, the app is
          the problem.
        </li>
      </ol>

      <p className="mt-8 text-sm">
        The list of banks, wallets and UPI apps comes from NPCI&apos;s public{" "}
        <a className="underline" href="https://www.npci.org.in/product/upi/all-members">
          UPI live members
        </a>{" "}
        page, last copied on {NPCI_SYNCED_AT}. If your bank is missing, it may not be live on UPI yet.
      </p>

      <div className="mt-10 rounded-[4px] border border-base-300">
        {rows.map(([name, cls, desc]) => (
          <div key={name} className="grid grid-cols-[6rem_1fr] gap-3 border-b border-base-300 px-4 py-3 last:border-0">
            <span className={`font-mono text-sm font-bold uppercase ${cls}`}>{name}</span>
            <span className="text-sm">{desc}</span>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Every status here comes from people reporting failed payments. None of it comes from NPCI, a bank or a UPI app,
        and it can be wrong. Use it to decide whether to try another bank or wait.
      </p>

      <section className="mt-12 border-t border-base-300 pt-8" aria-labelledby="made-by">
        <h2 id="made-by" className="font-display text-2xl font-bold">
          Made by
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed">
          <span className="font-medium text-base-content">Nishal K</span>
          {" · "}
          <a
            className="underline underline-offset-2 hover:text-base-content"
            href="https://github.com/nishal21"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/nishal21
          </a>
          {" · "}
          <a
            className="underline underline-offset-2 hover:text-base-content"
            href="https://nishal.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            nishal.dev
          </a>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Source:{" "}
          <a
            className="underline underline-offset-2 hover:text-base-content"
            href="https://github.com/nishal21/upi-Down"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/nishal21/upi-Down
          </a>
        </p>
      </section>
    </article>
  );
}
