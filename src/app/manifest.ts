import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ali Mankadin Eha — Two sides. One land.",
    short_name: "Ali Mankadin Eha",
    description: "T-shirts from Sri Lanka. LKR 1,000 from every shirt funds elephant-safe fences and farmer support.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1d4b34",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png?v=3", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png?v=3", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png?v=3", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Shop", url: "/shop", icons: [{ src: "/icons/icon-192.png?v=3", sizes: "192x192" }] },
      { name: "Bag", url: "/bag", icons: [{ src: "/icons/icon-192.png?v=3", sizes: "192x192" }] },
      { name: "The Fund", url: "/fund", icons: [{ src: "/icons/icon-192.png?v=3", sizes: "192x192" }] },
    ],
  };
}
