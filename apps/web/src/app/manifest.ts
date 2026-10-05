import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UPI Down? Live bank UPI status",
    short_name: "UPI Down?",
    description: "Is your bank's UPI down, or is it just you? Live status from user reports.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f110e",
    theme_color: "#0f110e",
    lang: "en-IN",
    categories: ["finance", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
