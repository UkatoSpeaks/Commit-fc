import { ShieldMark } from "@/components/ui/Logo";

interface SealedPackProps {
  /** Text under the logo, e.g. "Tap to open" or "Scouting…" */
  caption: string;
  className?: string;
}

/** The closed pack. Pure markup so it can be a Suspense fallback too. */
export function SealedPack({ caption, className }: SealedPackProps) {
  return (
    <div
      className={`relative flex h-[340px] w-[230px] flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-accent bg-surface ${className ?? ""}`}
      style={{
        boxShadow: "0 0 0 6px rgba(61,220,132,0.08), 0 0 60px rgba(61,220,132,0.35), inset 0 0 40px rgba(61,220,132,0.12)",
        backgroundImage: "radial-gradient(circle at 50% 30%, rgba(245,230,168,0.10), transparent 60%)",
      }}
    >
      <ShieldMark size={64} />
      <span className="display text-3xl font-extrabold tracking-[0.06em]">Commit FC</span>
      <span className="mono-label text-xs text-accent">{caption}</span>
    </div>
  );
}

/** Full-screen stage used while the player loads on the server. */
export function RevealFallback() {
  return (
    <div className="flex min-h-[100dvh] flex-1 items-center justify-center bg-bg px-4" role="status" aria-live="polite">
      <SealedPack caption="Scouting…" className="animate-pulse" />
    </div>
  );
}
