import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

/* Dominio real de ESTE sitio (v1.47): antes apuntaba a
   portafolio-charli.vercel.app, que sirve el portafolio antiguo,
   así que las vistas previas al compartir resolvían la imagen
   contra el sitio equivocado. */
const SITE_URL = "https://charli-ai-portfolio.vercel.app";
/* Miniatura al compartir: captura real del hero (1200×630). */
const SHARE_IMAGE = "/og.jpg";

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
  /* v1.47: el icono de la pestaña es el ALIEN de la barra de
     navegación (public/images/logo.jpeg) en formato cuadrado —
     el antiguo logo.svg no era el alien y los navegadores
     modernos lo preferían sobre el .ico. */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
        width: 1200,
        height: 630,
        alt: "CHARLI AI — Tecnólogo creativo en IA (hero de la web)",
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
