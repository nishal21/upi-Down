import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy – what UPI Down? collects",
  description:
    "What UPI Down? stores when you report a failed UPI payment: short-lived device hash, no login, no UPI ID or account numbers, no payment processing. Last updated October 2026.",
  alternates: { canonical: "/privacy/" },
  openGraph: {
    title: "Privacy · UPI Down?",
    description: "No login, no UPI ID, no payment details. What we collect and how long it is kept.",
    url: "/privacy/",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const UPDATED = "5 October 2026";

export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-10 leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:ps-5">
      <h1 className="font-display text-4xl font-extrabold">Privacy</h1>
      <p className="board-label mt-2">Last updated {UPDATED}</p>

      <p>
        UPI Down? (“the app”) shows whether UPI payments look down for a bank, based on anonymous reports. It has no
        accounts and never asks for your name, phone number, UPI ID, bank account or any payment details.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <b>Your report:</b> the bank you chose, the problem type (failed, pending or slow), the UPI app if you picked one,
          and the time. This is stored without any link to you.
        </li>
        <li>
          <b>A random install ID:</b> created on your device so one phone can't flood reports. The server only keeps a
          hashed form with a salt that changes every day, for at most 10 minutes per bank, in temporary memory (Redis). It
          is never stored with your reports.
        </li>
        <li>
          <b>Your IP address:</b> used only for rate limiting, hashed the same way, kept for at most 1 hour, and never
          stored with your reports.
        </li>
        <li>
          <b>On your device only:</b> your favourite banks, theme, language and the last status (for offline use).
        </li>
      </ul>

      <h2>What we don't do</h2>
      <ul>
        <li>No ads, no analytics or tracking SDKs, no selling or sharing of data.</li>
        <li>No access to SMS, contacts, location, camera or files.</li>
        <li>No payments are processed. We are not affiliated with NPCI, any bank or any UPI app.</li>
      </ul>

      <h2>Retention</h2>
      <p>
        Individual reports are deleted after 30 days. Hourly totals per bank (for example “SBI: 42 reports at 10:00”) are
        kept to show history and contain no personal data.
      </p>

      <h2>Security</h2>
      <p>All traffic uses HTTPS. The server is a private VPS behind Cloudflare.</p>

      <h2>Spam protection</h2>
      <p>
        During heavy traffic, the app may show a Cloudflare Turnstile check. Cloudflare processes that check under its
        own privacy policy.
      </p>

      <h2>Deleting your data</h2>
      <p>
        There is no account to delete. Clearing the app's storage or uninstalling removes everything on your device;
        server-side data is already anonymous and expires as described above.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <a className="underline" href="mailto:nishal@nishal.dev">nishal@nishal.dev</a>
      </p>
    </article>
  );
}
