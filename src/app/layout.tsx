import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
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
    title: "CHARLI AI — Tecnólogo Creativo en IA",
    description:
      "Experiencias digitales, sistemas creativos y automatizaciones potenciadas por IA.",
    siteName: "CHARLI AI",
    type: "website",
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
