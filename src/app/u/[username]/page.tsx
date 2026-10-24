import type { Metadata } from "next";
import { Suspense } from "react";
import { RevealFallback } from "@/components/reveal/SealedPack";
import { getPlayer } from "@/lib/player";
import { aOrAn } from "@/lib/ui/grammar";
import { PlayerView } from "./PlayerView";

// generateMetadata and the page both call getPlayer(); React cache() makes that one call per request.

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const result = await getPlayer(username);
  if (!result.ok) return { title: { absolute: `@${username} | Commit FC` } };

  const { player } = result;
  const title = `${player.profile.login} · ${player.overall} ${player.position.pitch} | Commit FC`;
  return {
    title: { absolute: title },
    description: `${player.profile.login} is ${aOrAn(player.overall)} ${player.overall}-rated ${player.position.label} on Commit FC.`,
  };
}

async function PlayerLoader({ params }: { params: PageProps<"/u/[username]">["params"] }) {
  const { username } = await params;
  const result = await getPlayer(username);
  return <PlayerView result={result} username={username} />;
}

export default function PlayerPage({ params }: PageProps<"/u/[username]">) {
  return (
    <Suspense fallback={<RevealFallback />}>
      <PlayerLoader params={params} />
    </Suspense>
  );
}
