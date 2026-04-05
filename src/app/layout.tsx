import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AllKit — Free Developer & AI Tools Online",
    template: "%s | AllKit",
  },
  description:
    "Free online developer tools and AI-powered utilities. JSON formatter, regex tester, background remover, OCR, and more. No signup required.",
  keywords: [
    "developer tools",
    "online tools",
    "json formatter",
    "regex tester",
    "base64 decode",
    "uuid generator",
    "background remover",
    "ai tools",
  ],
  metadataBase: new URL("https://allkit.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://allkit.dev",
    siteName: "AllKit",
    title: "AllKit — Free Developer & AI Tools Online",
    description:
      "Free online developer tools and AI-powered utilities. No signup required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AllKit — Free Developer & AI Tools Online",
    description:
      "Free online developer tools and AI-powered utilities. No signup required.",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#6366f1",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AllKit",
              url: "https://allkit.dev",
              description:
                "Free online developer tools and AI-powered utilities. No signup required.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://allkit.dev/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
