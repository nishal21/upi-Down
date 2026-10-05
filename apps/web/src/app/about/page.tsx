import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works",
  description: "How UPI Down? turns anonymous failed-payment reports into a live bank status.",
  alternates: { canonical: "/about/" },
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
      <h1 className="font-display text-4xl font-extrabold">How it works</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        When a UPI payment fails, you can't tell if it's the bank, the app or your phone. UPI Down? asks everyone the same
        question and shows the answer live.
      </p>

      <ol className="mt-8 space-y-4 font-mono text-sm">
        <li>
          <b>01</b> · Someone taps “Payment failed on this bank”.
        </li>
        <li>
          <b>02</b> · We count reports per bank over the last 15 minutes and compare with what's normal for that hour.
        </li>
        <li>
          <b>03</b> · Many people failing on one bank → that bank looks down. One app failing on many banks → the app is the
          problem.
        </li>
      </ol>

      <div className="mt-10 rounded-[4px] border border-base-300">
        {rows.map(([name, cls, desc]) => (
          <div key={name} className="grid grid-cols-[6rem_1fr] gap-3 border-b border-base-300 px-4 py-3 last:border-0">
            <span className={`font-mono text-sm font-bold uppercase ${cls}`}>{name}</span>
            <span className="text-sm">{desc}</span>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        This is a community pulse, not an official feed. It is not from NPCI, any bank or any UPI app, and it can be wrong.
        Use it to decide whether to try another bank or wait.
      </p>
    </article>
  );
}
