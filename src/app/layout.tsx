import type { Metadata, Viewport } from "next";
import { Abhaya_Libre, Google_Sans_Flex, Noto_Sans_Sinhala } from "next/font/google";
import { Announcement, Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Providers } from "@/components/Providers";
import { ServiceWorker } from "@/components/ServiceWorker";
import { getFundStats, getProducts } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import "./globals.css";

const sans = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-google-sans-flex",
  display: "swap",
  adjustFontFallback: false,
});

const sinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sinhala",
  display: "swap",
});

// Display face for the Sinhala brand name in the nav and footer.
const brand = Abhaya_Libre({
  subsets: ["sinhala"],
  weight: ["800"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Ali Mankadin Eha — Two sides. One land.", template: "%s — Ali Mankadin Eha" },
  description:
    "An independent T-shirt brand from Sri Lanka. LKR 1,000 from every shirt funds elephant-safe fences, warning lights and harvest support for farming families.",
  applicationName: "Ali Mankadin Eha",
  appleWebApp: { capable: true, title: "Ali Mankadin Eha", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/favicon-48.png?v=3", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png?v=3",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1d4b34",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before paint so the saved or system theme applies without a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('gaja-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;if(t==='dark'){var m=document.querySelector('meta[name="theme-color"]');m&&m.setAttribute('content','#0d1712')}}catch(e){document.documentElement.dataset.theme='light'}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();
  const [stats, products] = await Promise.all([getFundStats(), getProducts()]);

  return (
    <html lang={locale} data-theme="light" data-scroll-behavior="smooth" className={`${sans.variable} ${sinhala.variable} ${brand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers t={t} locale={locale}>
          <Announcement t={t} />
          <Nav raised={stats.raised} goal={stats.goal} />
          <main id="main">{children}</main>
          <Footer t={t} products={products.map((p) => ({ slug: p.slug, name: (locale === "si" && p.name_si) || p.name }))} />
        </Providers>
        <ServiceWorker />
      </body>
    </html>
  );
}
