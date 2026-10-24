import { PlayerCard } from "@/components/card/PlayerCard";
import { SAMPLE_CARDS } from "@/lib/ui/samples";

/** Three fanned, gently floating sample cards over a floodlit pitch. */
export function SampleCards() {
  return (
    <div className="relative mx-auto flex h-[400px] w-full max-w-[560px] items-center justify-center overflow-x-clip sm:h-[540px]" aria-label="Sample player cards" role="group">
      {/* Floodlight glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(closest-side at 50% 45%, rgba(61,220,132,0.22), transparent 75%), radial-gradient(closest-side at 50% 10%, rgba(245,230,168,0.10), transparent 70%)",
        }}
      />
      {/* Pitch ellipse */}
      <div aria-hidden="true" className="absolute bottom-4 left-1/2 h-24 w-[90%] -translate-x-1/2 rounded-[50%] border border-accent/25" />

      <div className="relative h-[440px] w-[300px] shrink-0 scale-[0.68] sm:scale-90 lg:scale-100">
        <div className="absolute inset-0" style={{ transform: "translateX(-46%) rotate(-11deg) scale(0.84)" }}>
          <div className="animate-float" style={{ animationDelay: "-2s" }}>
            <PlayerCard data={SAMPLE_CARDS.silver} />
          </div>
        </div>
        <div className="absolute inset-0" style={{ transform: "translateX(46%) rotate(10deg) scale(0.84)" }}>
          <div className="animate-float" style={{ animationDelay: "-4s" }}>
            <PlayerCard data={SAMPLE_CARDS.gold} />
          </div>
        </div>
        <div className="absolute inset-0" style={{ filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.65))" }}>
          <div className="animate-float">
            <PlayerCard data={SAMPLE_CARDS.special} />
          </div>
        </div>
      </div>
    </div>
  );
}
