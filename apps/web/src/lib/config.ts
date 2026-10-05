export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://upidown.nishal.dev").replace(/\/$/, "");
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export const bankSlug = (id: string) => `${id}-upi-down`;
export const bankUrl = (id: string) => `${SITE_URL}/${bankSlug(id)}/`;
