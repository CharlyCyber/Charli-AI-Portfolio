import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const SITE_URL = "https://portafolio-charli.vercel.app";
const SHARE_IMAGE = "/og.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CHARLI AI — Tecnólogo Creativo en IA | Portafolio y Brief Comercial",
  description:
    "Experiencias digitales, sistemas creativos y automatizaciones potenciadas por inteligencia artificial.",
  keywords: [
    "CHARLI AI",
    "Tecnólogo creativo en IA",
    "automatización con IA",
    "agentes IA",
    "experiencias web",
    "landing pages",
    "dirección artística",
    "bots de Telegram",
  ],
  authors: [{ name: "CHARLI AI" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    url: SITE_URL,
    siteName: "CHARLI AI",
    locale: "es_ES",
    type: "website",
    title: "CHARLI AI — Tecnólogo Creativo en IA",
    description:
      "Experiencias digitales, sistemas creativos y automatizaciones potenciadas por IA.",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1800,
        height: 945,
        alt: "CHARLI AI — Tecnólogo creativo en IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CHARLI AI — Tecnólogo Creativo en IA",
    description:
      "Experiencias digitales, sistemas creativos y automatizaciones potenciadas por IA.",
    images: [SHARE_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
