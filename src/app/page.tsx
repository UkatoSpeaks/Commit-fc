import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingNav } from "@/components/landing/LandingNav";
import { RatingsExplainer } from "@/components/landing/RatingsExplainer";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <RatingsExplainer />
      </main>
      <Footer />
    </>
  );
}
