import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DOGM.AI Certificates - Digital Certificate Management Platform",
    template: "%s | DOGM.AI Certificates",
  },
  description:
    "Create, manage, and share professional digital certificates. Instantly verifiable and shareable on social media.",
  keywords: [
    "digital certificates",
    "certificate management",
    "verification",
    "credentials",
    "professional certificates",
    "online certificates",
  ],
  authors: [{ name: "DOGM.AI" }],
  creator: "DOGM.AI",
  publisher: "DOGM.AI",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DOGM.AI Certificates",
    title: "DOGM.AI Certificates - Digital Certificate Management Platform",
    description:
      "Create, manage, and share professional digital certificates. Instantly verifiable and shareable on social media.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DOGM.AI Certificates",
    description:
      "Create, manage, and share professional digital certificates.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
