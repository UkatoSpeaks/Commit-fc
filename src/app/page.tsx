import { Suspense } from "react";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingNav } from "@/components/landing/LandingNav";
import { LedTicker } from "@/components/landing/LedTicker";
import { RatingsExplainer } from "@/components/landing/RatingsExplainer";
import { TransitionWipe } from "@/components/landing/TransitionWipe";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <Hero />
        {/* Cached for 24h, so it's part of the static shell; the fallback only shows if the cache is cold. */}
        <Suspense fallback={null}>
          <LedTicker />
        </Suspense>
        <HowItWorks />
        <RatingsExplainer />
        <FinalCta />
      </main>
      <Footer />
      <TransitionWipe />
    </>
  );
}
