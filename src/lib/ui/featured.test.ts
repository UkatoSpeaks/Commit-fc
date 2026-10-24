import { describe, expect, it } from "vitest";
import type { PlayerResult } from "@/lib/player/types";
import type { Player } from "@/lib/stats";
import { MIN_FEATURED, pickFeatured } from "./featured";

const ok = (overall: number): PlayerResult => ({
  ok: true,
  cacheHit: false,
  player: { overall, tier: "gold", position: { pitch: "ST" } } as unknown as Player,
});
const fail: PlayerResult = { ok: false, error: { code: "USER_NOT_FOUND", status: 404, message: "nope" } };

describe("pickFeatured", () => {
  const names = ["a", "b", "c", "d", "e"];

  it("skips players that failed and keeps config order", () => {
    const picked = pickFeatured(names, [ok(80), fail, ok(70), ok(90), ok(60)]);
    expect(picked.map((p) => p.username)).toEqual(["a", "c", "d", "e"]);
    expect(picked[0]).toEqual({ username: "a", overall: 80, pitch: "ST", tier: "gold" });
  });

  it(`returns nothing when fewer than ${MIN_FEATURED} load`, () => {
    expect(pickFeatured(names, [ok(80), fail, fail, ok(90), ok(60)])).toEqual([]);
  });

  it("treats missing results as failures", () => {
    expect(pickFeatured(names, [ok(80), ok(81)])).toEqual([]);
  });
});
