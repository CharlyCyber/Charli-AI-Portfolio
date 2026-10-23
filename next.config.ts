import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false,
  /* Fix-8: la pasarela del preview sirve el sitio desde
     *.space-z.ai con un origen distinto de localhost:3000 — sin
     esto, Next 16 dispara el overlay de advertencia por las
     peticiones cross-origin a /_next/*. El comodín cubre cualquier
     chat-id de la pasarela. */
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
