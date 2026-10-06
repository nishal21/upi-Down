import type { Bank } from "@upi-down/shared";
import { BOARD_BANKS } from "@upi-down/shared";
import { SITE_URL, bankSlug, bankUrl } from "./config";

export const SITE_NAME = "UPI Down?";
export const SITE_TAGLINE = "Live bank UPI status from user reports";

export const DEFAULT_TITLE = "UPI Down today? Live bank UPI status from user reports";
export const DEFAULT_DESCRIPTION =
  "Is UPI down right now, or is it just you? Check live status for SBI, HDFC, ICICI, PhonePe, Google Pay and every NPCI UPI bank from anonymous failed-payment reports. Free, no login. Not affiliated with NPCI.";

export const HOME_KEYWORDS = [
  "upi down",
  "upi down today",
  "upi not working",
  "upi server down",
  "is upi down right now",
  "sbi upi down",
  "hdfc upi down",
  "icici upi down",
  "phonepe not working",
  "google pay not working",
  "bank server down today",
  "upi failed payment",
  "npci down",
];

export function bankKeywords(bank: Bank): string[] {
  const short = bank.short.toLowerCase();
  const name = bank.name.toLowerCase();
  return [
    `${short} upi down`,
    `${short} upi not working`,
    `${name} upi down`,
    `${name} upi not working`,
    `${short} upi server down today`,
    `is ${short} upi down`,
    "upi down today",
    "upi not working",
  ];
}

export function bankFaq(bank: Bank) {
  const { short, name } = bank;
  return [
    {
      q: `Is ${short} UPI down right now?`,
      a: `Open this page to see live ${name} UPI status from recent user reports. If many people report failed ${short} payments in the last 15 minutes, we mark ${short} as down or slow. If reports are few, the problem is more likely your app, network or phone.`,
    },
    {
      q: `How do I know if ${short} UPI is down?`,
      a: `When many people report failed ${short} UPI payments within 15 minutes, this page marks ${short} as down. If there are few or no reports, try another UPI app, switch Wi‑Fi/mobile data, or wait and retry.`,
    },
    {
      q: `My ${short} UPI payment failed but money was debited. What now?`,
      a: `Failed UPI debits are usually reversed automatically, often within 24–48 hours. Keep the UPI transaction ID (RRN) and raise a complaint in your UPI app or with ${name} if it is not reversed.`,
    },
    {
      q: `Why does ${short} UPI fail on one app but work on another?`,
      a: `If only one UPI app fails while the same ${short} account works in another app, the app or its link to the bank is the problem, not the whole bank. Try Google Pay, PhonePe, Paytm, BHIM or the bank's own app.`,
    },
    {
      q: "Is UPI Down? an official NPCI or bank status page?",
      a: "No. Status comes only from recent reports by users like you. It is not from NPCI, any bank or any UPI app, and it can be wrong. Use it to decide whether to try another bank or wait.",
    },
  ];
}

export function homeFaq() {
  return [
    {
      q: "Is UPI down right now?",
      a: "Check the live board on UPI Down?. Status is based on anonymous failed-payment reports from the last 15 minutes across Indian banks and UPI apps. If many people fail on one bank, that bank looks down. If one app fails on many banks, the app is the problem.",
    },
    {
      q: "How do I check if my bank's UPI is down?",
      a: "Search your bank on upidown.nishal.dev, open its page, and read the live status (Down, Slow, Working or No info). You can also tap Payment failed to add your report so others see it.",
    },
    {
      q: "Why did my UPI payment fail?",
      a: "Common causes are a bank outage, a UPI app issue, poor network, daily limits, low balance or a pending debit. UPI Down? helps separate bank-wide problems from issues that are only on your phone.",
    },
    {
      q: "Is this official data from NPCI?",
      a: "No. UPI Down? is crowd-sourced and not affiliated with NPCI, any bank or any UPI app. Official settlement data does not power this board.",
    },
  ];
}

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function majorBankLinks() {
  return BOARD_BANKS.filter((b) => b.tier === 1).map((b) => ({
    name: b.name,
    short: b.short,
    href: `/${bankSlug(b.id)}/`,
    url: bankUrl(b.id),
  }));
}

export function jsonLdGraph(nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
