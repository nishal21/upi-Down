export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://upidown.nishal.dev").replace(/\/$/, "");
/** Always absolute in production / Capacitor — relative /api hits the WebView host, not the API. */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://upidown.nishal.dev"
).replace(/\/$/, "");
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export const bankSlug = (id: string) => `${id}-upi-down`;
export const bankUrl = (id: string) => `${SITE_URL}/${bankSlug(id)}/`;
