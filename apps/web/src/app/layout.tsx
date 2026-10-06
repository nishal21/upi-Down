import type { Metadata, Viewport } from "next";
import {
  Anek_Devanagari,
  Anek_Latin,
  JetBrains_Mono,
  Mukta,
  Noto_Sans_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Oriya,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";
import { Banners, Footer, Header } from "@/components/chrome";
import { SITE_URL } from "@/lib/config";
import { ogImages, twitterImages } from "@/lib/seo";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const anek = Anek_Latin({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-anek", display: "swap" });
const anekDeva = Anek_Devanagari({
  subsets: ["devanagari"],
  weight: ["600", "800"],
  variable: "--font-anek-deva",
  display: "swap",
  preload: false,
});
const mukta = Mukta({ subsets: ["latin", "devanagari"], weight: ["400", "600"], variable: "--font-mukta", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-jetbrains", display: "swap" });

// Script fonts download only when their glyphs appear (unicode-range), so English visitors fetch none of them.
const beng = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-noto-beng", display: "swap", preload: false, adjustFontFallback: false });
const telu = Noto_Sans_Telugu({ subsets: ["telugu"], variable: "--font-noto-telu", display: "swap", preload: false, adjustFontFallback: false });
const taml = Noto_Sans_Tamil({ subsets: ["tamil"], variable: "--font-noto-taml", display: "swap", preload: false, adjustFontFallback: false });
const gujr = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-noto-gujr", display: "swap", preload: false, adjustFontFallback: false });
const knda = Noto_Sans_Kannada({ subsets: ["kannada"], variable: "--font-noto-knda", display: "swap", preload: false, adjustFontFallback: false });
const mlym = Noto_Sans_Malayalam({ subsets: ["malayalam"], variable: "--font-noto-mlym", display: "swap", preload: false, adjustFontFallback: false });
const orya = Noto_Sans_Oriya({ subsets: ["oriya"], variable: "--font-noto-orya", display: "swap", preload: false, adjustFontFallback: false });
const guru = Noto_Sans_Gurmukhi({ subsets: ["gurmukhi"], variable: "--font-noto-guru", display: "swap", preload: false, adjustFontFallback: false });
const arab = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto-arab", display: "swap", preload: false, adjustFontFallback: false });
const scriptVars = [beng, telu, taml, gujr, knda, mlym, orya, guru, arab].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "UPI Down today? Live bank UPI status from user reports", template: "%s · UPI Down?" },
  description:
    "Is UPI down right now, or is it just you? Live status for Indian banks and UPI apps from anonymous failed-payment reports. Free, no login. Not affiliated with NPCI.",
  applicationName: "UPI Down?",
  keywords: [
    "upi down",
    "upi down today",
    "upi not working",
    "is upi down right now",
    "sbi upi down",
    "hdfc upi down",
    "icici upi down",
    "upi server down today",
    "bank server down",
    "phonepe not working",
    "google pay not working",
  ],
  authors: [{ name: "Nishal K", url: "https://github.com/nishal21" }],
  creator: "Nishal K",
  publisher: "UPI Down?",
  category: "finance",
  openGraph: {
    type: "website",
    siteName: "UPI Down?",
    locale: "en_IN",
    url: SITE_URL,
    title: "Is UPI down right now? Live bank status",
    description: "Live UPI status for Indian banks from user reports. Not affiliated with NPCI or any bank.",
    images: ogImages(),
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  twitter: {
    card: "summary_large_image",
    title: "Is UPI down right now?",
    description: "Live bank UPI status from user reports in India.",
    images: twitterImages(),
  },
  alternates: { canonical: "/", languages: { "en-IN": "/", "x-default": "/" } },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  appleWebApp: { capable: true, title: "UPI Down?", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f110e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-theme="upidown-dark"
      className={`${anek.variable} ${anekDeva.variable} ${mukta.variable} ${mono.variable} ${scriptVars}`}
      suppressHydrationWarning
    >
      <body>
        {/* Blocking — next/script beforeInteractive is deferred and lets SSR home flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <AppShell>
          <TooltipProvider delayDuration={300}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-base-content focus:px-3 focus:py-2 focus:text-base-100"
            >
              Skip to content
            </a>
            <Header />
            <Banners />
            <main id="main">{children}</main>
            <Footer />
            <Toaster position="top-center" offset={{ top: "0.75rem" }} mobileOffset={{ top: "0.75rem" }} />
          </TooltipProvider>
        </AppShell>
      </body>
    </html>
  );
}
