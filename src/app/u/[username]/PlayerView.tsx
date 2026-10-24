"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/landing/Footer";
import { CardColumn } from "@/components/report/CardColumn";
import { PageNav } from "@/components/report/PageNav";
import { ScoutReport } from "@/components/report/ScoutReport";
import { ErrorState } from "@/components/reveal/ErrorState";
import { PackReveal } from "@/components/reveal/PackReveal";
import { RevealFallback } from "@/components/reveal/SealedPack";
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
  const reduced = useReducedMotion();
  const login = player.profile.login;
  const card = useMemo(() => toCardData(player), [player]);
  const [reveal, setReveal] = useState<RevealState>("pending");

  // sessionStorage and the motion preference are only known in the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReveal(reduced || readSeen(login) ? "done" : "playing");
  }, [login, reduced]);

  const finish = useCallback(() => {
    markSeen(login);
    setReveal("done");
  }, [login]);

  if (reveal === "pending") return <RevealFallback />;
  if (reveal === "playing") return <PackReveal data={card} onDone={finish} />;

  return (
    <>
      <PageNav />
      <main className="mx-auto grid w-full max-w-6xl flex-1 content-start grid-cols-[minmax(0,1fr)] gap-10 px-4 pt-4 pb-16 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <CardColumn data={card} />
        </div>
        <ScoutReport player={player} />
      </main>
      <Footer />
    </>
  );
}

export function PlayerView({ result, username }: { result: PlayerResult; username: string }) {
  if (!result.ok) return <ErrorState error={result.error} username={username} />;
  // Key by login so moving between players resets the reveal.
  return <PlayerPage key={result.player.profile.login} player={result.player} />;
}
