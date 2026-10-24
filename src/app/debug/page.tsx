"use client";

import { useState, type FormEvent } from "react";
import type { Player, StatKey } from "@/lib/stats";

// Debug page for checking raw numbers. The real UI lives at / and /u/[username].

const STAT_LABELS: Record<StatKey, string> = {
  PAC: "Activity",
  SHO: "Impact",
  PAS: "Collaboration",
  DRI: "Versatility",
  DEF: "Reliability",
  PHY: "Stamina",
};

interface ApiError {
  error: { code: string; message: string };
}

function StatBar({ stat, value }: { stat: StatKey; value: number }) {
  return (
    <div className="flex items-center gap-3 font-mono text-sm">
      <span className="w-10 font-bold">{stat}</span>
      <span className="w-28 text-zinc-500">{STAT_LABELS[stat]}</span>
      <div className="h-3 flex-1 rounded bg-zinc-200 dark:bg-zinc-800">
        <div className="h-3 rounded bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right">{value}</span>
    </div>
  );
}

function PlayerSummary({ player }: { player: Player }) {
  const { extras } = player;
  return (
    <section className="space-y-4">
      <div className="font-mono text-lg">
        <strong>{player.overall}</strong> · {player.position.label} ({player.position.code}) · {player.tier}
      </div>
      <div className="space-y-2">
        {(Object.keys(STAT_LABELS) as StatKey[]).map((k) => (
          <StatBar key={k} stat={k} value={player.stats[k]} />
        ))}
      </div>
      <ul className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
        <li>Location: {extras.location ?? "—"}</li>
        <li>Club: {extras.club ?? "—"}</li>
        <li>Top languages: {extras.topLanguages.map((l) => `${l.name} ${(l.share * 100).toFixed(1)}%`).join(", ") || "—"}</li>
        <li>Streak: {extras.streaks.current} current / {extras.streaks.longest} longest</li>
        <li>External PRs: {player.profile.externalPRs.opened} opened / {extras.mergedExternalPRs} merged</li>
      </ul>
    </section>
  );
}

export default function DebugPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    setPlayer(null);
    try {
      const res = await fetch(`/api/player/${encodeURIComponent(name)}`);
      const body = (await res.json()) as Player | ApiError;
      if ("error" in body) setError(`${body.error.code}: ${body.error.message}`);
      else setPlayer(body);
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-6 bg-white p-6 text-zinc-900 dark:bg-transparent dark:text-zinc-100">
      <h1 className="text-2xl font-bold">Commit FC — stats debug</h1>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHub username"
          className="flex-1 rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
        />
        <button disabled={loading} className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black">
          {loading ? "Loading…" : "Rate"}
        </button>
      </form>
      {error && <p className="font-mono text-sm text-red-600">{error}</p>}
      {player && (
        <>
          <PlayerSummary player={player} />
          <details open>
            <summary className="cursor-pointer font-mono text-sm">Raw JSON</summary>
            <pre className="mt-2 max-h-[60vh] overflow-auto rounded bg-zinc-100 p-4 text-xs dark:bg-zinc-900">
              {JSON.stringify({ ...player, profile: { ...player.profile, contributions: { ...player.profile.contributions, calendar: `[${player.profile.contributions.calendar.length} days]` } } }, null, 2)}
            </pre>
          </details>
        </>
      )}
    </main>
  );
}
