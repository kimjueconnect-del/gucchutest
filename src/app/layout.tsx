import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://gucchutest.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gucchu Test — Organised Wholesale from Delhi, Delivered Pan-India",
    template: "%s | Gucchu Test",
  },
  description:
    "Gucchu Test connects bulk buyers across India with verified Delhi wholesalers. Browse furniture, electricals, decor, hardware and more — bulk pricing, verified vendors, integrated transport.",
  keywords: [
    "wholesale", "Delhi wholesale market", "bulk buy", "furniture wholesale",
    "electrical wholesale", "B2B marketplace India", "Gucchu Test",
    "bulk furniture India", "wholesale chandelier", "wholesale electrical",
  ],
  authors: [{ name: "Gucchu Test" }],
  creator: "Gucchu Test",
  publisher: "Gucchu Test",
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
  manifest: "/manifest.json",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gucchu Test — Organised Wholesale from Delhi",
    description: "Verified Delhi wholesalers, bulk pricing, integrated pan-India delivery. Furniture, electricals, decor, hardware and more.",
    url: SITE_URL,
    siteName: "Gucchu Test",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/logo.svg", width: 32, height: 32, alt: "Gucchu Test" }],
  },
  twitter: {
    card: "summary",
    title: "Gucchu Test — Organised Wholesale from Delhi",
    description: "Verified Delhi wholesalers, bulk pricing, integrated pan-India delivery.",
    images: ["/logo.svg"],
  },
  category: "shopping",
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1f5d4a" },
    { media: "(prefers-color-scheme: dark)", color: "#0d2620" },
  ],
  width: "device-width",
  initialScale: 1,
};

// JSON-LD structured data for rich search results.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Gucchu Test",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: "Organised wholesale marketplace connecting bulk buyers across India with verified Delhi wholesalers.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Delhi",
    addressRegion: "Delhi",
    addressCountry: "IN",
  },
  sameAs: [],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Gucchu Test",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
