import { NPCI_APPS, NPCI_BANKS } from "./npci.generated";

export interface Bank {
  id: string;
  name: string;
  short: string;
  aliases: string[];
  /** 1–3 are on the board by default; 4 is every other NPCI member, reachable through search. */
  tier: 1 | 2 | 3 | 4;
  /** Runs its own UPI app (PSP on NPCI's list). */
  psp: boolean;
  /** Prepaid wallet issuer rather than a bank. */
  ppi: boolean;
}

type Curated = Pick<Bank, "name" | "short" | "aliases" | "tier">;

const CURATED: Record<string, Curated> = {
  sbi: { name: "State Bank of India", short: "SBI", aliases: ["state bank", "sbi", "yono"], tier: 1 },
  hdfc: { name: "HDFC Bank", short: "HDFC", aliases: ["hdfc"], tier: 1 },
  icici: { name: "ICICI Bank", short: "ICICI", aliases: ["icici", "imobile"], tier: 1 },
  axis: { name: "Axis Bank", short: "AXIS", aliases: ["axis"], tier: 1 },
  kotak: { name: "Kotak Mahindra Bank", short: "KOTAK", aliases: ["kotak", "kotak811", "811"], tier: 1 },
  pnb: { name: "Punjab National Bank", short: "PNB", aliases: ["punjab national", "pnb"], tier: 1 },
  bob: { name: "Bank of Baroda", short: "BOB", aliases: ["baroda", "bob", "bob world"], tier: 1 },
  canara: { name: "Canara Bank", short: "CANARA", aliases: ["canara"], tier: 1 },
  union: { name: "Union Bank of India", short: "UBI", aliases: ["union bank", "ubi"], tier: 1 },
  idfc: { name: "IDFC FIRST Bank", short: "IDFC", aliases: ["idfc first", "idfc"], tier: 1 },
  yes: { name: "Yes Bank", short: "YES", aliases: ["yes bank"], tier: 1 },
  indusind: { name: "IndusInd Bank", short: "INDUS", aliases: ["indusind", "indus"], tier: 1 },
  boi: { name: "Bank of India", short: "BOI", aliases: ["bank of india", "boi"], tier: 2 },
  indian: { name: "Indian Bank", short: "INDIAN", aliases: ["indian bank"], tier: 2 },
  iob: { name: "Indian Overseas Bank", short: "IOB", aliases: ["indian overseas", "iob"], tier: 2 },
  central: { name: "Central Bank of India", short: "CBI", aliases: ["central bank"], tier: 2 },
  uco: { name: "UCO Bank", short: "UCO", aliases: ["uco"], tier: 2 },
  bom: { name: "Bank of Maharashtra", short: "BOM", aliases: ["maharashtra", "mahabank"], tier: 2 },
  psb: { name: "Punjab & Sind Bank", short: "PSB", aliases: ["punjab sind", "psb"], tier: 3 },
  au: { name: "AU Small Finance Bank", short: "AU", aliases: ["au bank", "au small"], tier: 2 },
  federal: { name: "Federal Bank", short: "FED", aliases: ["federal"], tier: 2 },
  idbi: { name: "IDBI Bank", short: "IDBI", aliases: ["idbi"], tier: 2 },
  rbl: { name: "RBL Bank", short: "RBL", aliases: ["rbl", "ratnakar"], tier: 2 },
  bandhan: { name: "Bandhan Bank", short: "BANDHAN", aliases: ["bandhan"], tier: 2 },
  "south-indian": { name: "South Indian Bank", short: "SIB", aliases: ["south indian", "sib"], tier: 3 },
  karur: { name: "Karur Vysya Bank", short: "KVB", aliases: ["karur vysya", "kvb"], tier: 3 },
  kbl: { name: "Karnataka Bank", short: "KBL", aliases: ["karnataka bank"], tier: 3 },
  tmb: { name: "Tamilnad Mercantile Bank", short: "TMB", aliases: ["tamilnad", "tmb"], tier: 3 },
  "city-union": { name: "City Union Bank", short: "CUB", aliases: ["city union", "cub"], tier: 3 },
  dcb: { name: "DCB Bank", short: "DCB", aliases: ["dcb", "development credit"], tier: 3 },
  csb: { name: "CSB Bank", short: "CSB", aliases: ["catholic syrian", "csb"], tier: 3 },
  jk: { name: "J&K Bank", short: "J&K", aliases: ["jammu kashmir", "jk bank"], tier: 3 },
  dhanlaxmi: { name: "Dhanlaxmi Bank", short: "DLB", aliases: ["dhanlaxmi", "dhanalakshmi"], tier: 3 },
  equitas: { name: "Equitas Small Finance Bank", short: "EQUITAS", aliases: ["equitas"], tier: 3 },
  ujjivan: { name: "Ujjivan Small Finance Bank", short: "UJJIVAN", aliases: ["ujjivan"], tier: 3 },
  airtel: { name: "Airtel Payments Bank", short: "AIRTEL", aliases: ["airtel payments"], tier: 2 },
  ippb: { name: "India Post Payments Bank", short: "IPPB", aliases: ["india post", "post office", "ippb"], tier: 2 },
  "jio-pb": { name: "Jio Payments Bank", short: "JIO", aliases: ["jio payments"], tier: 3 },
  fino: { name: "Fino Payments Bank", short: "FINO", aliases: ["fino"], tier: 3 },
  hsbc: { name: "HSBC India", short: "HSBC", aliases: ["hsbc"], tier: 3 },
  sc: { name: "Standard Chartered", short: "SCB", aliases: ["standard chartered", "stanchart"], tier: 3 },
};

const curatedOrder = Object.keys(CURATED);

export const BANKS: Bank[] = NPCI_BANKS.map((n) => {
  const c = CURATED[n.id];
  return c ? { id: n.id, ...c, psp: n.psp, ppi: n.ppi } : { ...n, aliases: [], tier: 4 as const };
}).sort((a, b) => {
  const ia = curatedOrder.indexOf(a.id);
  const ib = curatedOrder.indexOf(b.id);
  if (ia >= 0 || ib >= 0) return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib);
  return a.name.localeCompare(b.name);
});

export const BOARD_BANKS = BANKS.filter((b) => b.tier < 4);

export const BANK_BY_ID: Record<string, Bank> = Object.fromEntries(BANKS.map((b) => [b.id, b]));

export interface UpiApp {
  id: string;
  name: string;
  short: string;
  /** Offered as a one-tap chip in the report form and always on the apps board. */
  featured: boolean;
}

const FEATURED_APPS: UpiApp[] = [
  { id: "gpay", name: "Google Pay", short: "GPAY", featured: true },
  { id: "phonepe", name: "PhonePe", short: "PE", featured: true },
  { id: "paytm", name: "Paytm", short: "PAYTM", featured: true },
  { id: "bhim", name: "BHIM", short: "BHIM", featured: true },
  { id: "amazonpay", name: "Amazon Pay", short: "AMZN", featured: true },
  { id: "cred", name: "CRED", short: "CRED", featured: true },
  { id: "navi", name: "Navi", short: "NAVI", featured: true },
  { id: "bank-app", name: "Bank's own app", short: "BANK", featured: true },
  { id: "whatsapp", name: "WhatsApp", short: "WA", featured: false },
  { id: "mobikwik", name: "MobiKwik", short: "MBK", featured: false },
  { id: "supermoney", name: "super.money", short: "SUPER", featured: false },
  { id: "flipkart", name: "Flipkart UPI", short: "FKRT", featured: false },
  { id: "tataneu", name: "Tata Neu", short: "NEU", featured: false },
  { id: "bharatpe", name: "BharatPe", short: "BPE", featured: false },
  { id: "groww", name: "Groww", short: "GROWW", featured: false },
  { id: "jupiter", name: "Jupiter", short: "JPTR", featured: false },
  { id: "payzapp", name: "PayZapp", short: "PZAP", featured: false },
];

const appShort = (name: string) =>
  name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w, _, all) => (all.length === 1 ? w.slice(0, 5) : w[0]))
    .join("")
    .slice(0, 5)
    .toUpperCase();

export const UPI_APPS: UpiApp[] = [
  ...FEATURED_APPS,
  ...NPCI_APPS.map((a) => ({ ...a, short: appShort(a.name), featured: false })),
];

/** Apps the board tracks even with zero reports. */
export const BOARD_APPS = FEATURED_APPS;

export const UPI_APP_BY_ID: Record<string, UpiApp> = Object.fromEntries(UPI_APPS.map((a) => [a.id, a]));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const bankIndex = BANKS.map((b) => ({ bank: b, hay: norm([b.short, b.name, ...b.aliases].join(" ")) }));

export function searchBanks(query: string, limit = Infinity): Bank[] {
  const q = norm(query);
  if (!q) return BOARD_BANKS;
  const words = q.split(" ");
  const out: Bank[] = [];
  for (const { bank, hay } of bankIndex) {
    if (words.every((w) => hay.includes(w))) out.push(bank);
    if (out.length >= limit) break;
  }
  return out;
}

export function searchApps(query: string, limit = 8): UpiApp[] {
  const q = norm(query);
  if (!q) return UPI_APPS.filter((a) => a.featured);
  return UPI_APPS.filter((a) => norm(a.name).includes(q)).slice(0, limit);
}
