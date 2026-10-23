import { SmoothScroll } from "@/components/site/smooth-scroll";
import { Loader } from "@/components/site/loader";
import { Navbar } from "@/components/site/navbar";
import { LiquidHero } from "@/components/site/liquid-hero";
import { AboutHorizontal } from "@/components/site/about-horizontal";
import { ScrollStroke } from "@/components/site/scroll-stroke";
import { Works } from "@/components/site/works";
import { Services } from "@/components/site/services";
import { Autodidact } from "@/components/site/autodidact";
import { DarkStatement } from "@/components/site/dark-statement";
import { Pricing } from "@/components/site/pricing";
import { CTA } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";
import { CookieBanner } from "@/components/site/cookie-banner";
import { DownloadCode } from "@/components/site/download-code";

export default function Home() {
  return (
    <SmoothScroll>
      <Loader />
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <LiquidHero />
          {/* El trazo que se dibuja con el scroll está FUSIONADO a
              las secciones: nace sobre el slide 05 · DISEÑO (último
              del «Quién soy») y desciende integrado en «Proyectos
              destacados» hasta despedir la sección — sin sección
              propia intermedia. */}
          <ScrollStroke>
            <AboutHorizontal />
            <Works />
          </ScrollStroke>
          <Services />
          <Autodidact />
          <DarkStatement />
          <Pricing />
          <CTA />
        </main>
        <Footer />
      </div>
      <CookieBanner />
      <DownloadCode />
    </SmoothScroll>
  );
}
