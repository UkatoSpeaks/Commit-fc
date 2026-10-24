"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Footer } from "@/components/landing/Footer";
import { CardColumn } from "@/components/report/CardColumn";
import { PageNav } from "@/components/report/PageNav";
import { ScoutReport } from "@/components/report/ScoutReport";
import { ErrorState } from "@/components/reveal/ErrorState";
import { PackReveal } from "@/components/reveal/PackReveal";
import { RevealFallback } from "@/components/reveal/SealedPack";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import type { PlayerResult } from "@/lib/player/types";
import type { Player } from "@/lib/stats";
import { toCardData } from "@/lib/ui/card-data";

type RevealState = "pending" | "playing" | "done";

const seenKey = (login: string) => `commitfc:revealed:${login.toLowerCase()}`;

function readSeen(login: string): boolean {
  try {
    return window.sessionStorage.getItem(seenKey(login)) === "1";
  } catch {
    return false;
  }
}

function markSeen(login: string): void {
  try {
    window.sessionStorage.setItem(seenKey(login), "1");
  } catch {
    // Storage blocked (private mode): the reveal will just play again.
  }
}

function PlayerPage({ player }: { player: Player }) {
  const login = player.profile.login;
  const card = useMemo(() => toCardData(player), [player]);
  const [reveal, setReveal] = useState<RevealState>("pending");
  const [announcement, setAnnouncement] = useState("");
  const cardSection = useRef<HTMLElement>(null);
  const justRevealed = useRef(false);

  // sessionStorage and the motion preference are only known in the browser.
  // Reduced motion: no timeline at all, the card shows straight away.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReveal(prefersReducedMotion() || readSeen(login) ? "done" : "playing");
  }, [login]);

  const finish = useCallback(() => {
    markSeen(login);
    justRevealed.current = true;
    setAnnouncement(`${card.name}, rated ${card.overall}, ${card.pitch}`);
    setReveal("done");
  }, [login, card]);

  // After a reveal, put keyboard and screen reader focus on the card.
  useEffect(() => {
    if (reveal !== "done" || !justRevealed.current) return;
    justRevealed.current = false;
    cardSection.current?.focus({ preventScroll: true });
  }, [reveal]);

  let body;
  if (reveal === "pending") body = <RevealFallback />;
  else if (reveal === "playing") body = <PackReveal key={login} data={card} onDone={finish} />;
  else
    body = (
      <>
        <PageNav />
        <main className="mx-auto grid w-full max-w-6xl flex-1 content-start grid-cols-[minmax(0,1fr)] gap-10 px-4 pt-4 pb-16 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-14">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <CardColumn ref={cardSection} data={card} />
          </div>
          <ScoutReport player={player} />
        </main>
        <Footer />
      </>
    );

  return (
    <>
      {/* Stays mounted through the reveal so the result is announced when it lands. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {body}
    </>
  );
}

export function PlayerView({ result, username }: { result: PlayerResult; username: string }) {
  if (!result.ok) return <ErrorState error={result.error} username={username} />;
  // Key by login so moving between players resets the reveal.
  return <PlayerPage key={result.player.profile.login} player={result.player} />;
}
