import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeProfile } from "@/lib/stats/__fixtures__/profile";

vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ connection: () => Promise.resolve() }));

const fetchGitHubProfile = vi.fn();
vi.mock("@/lib/github", async () => {
  const errors = await import("@/lib/github/errors");
  const username = await import("@/lib/github/username");
  return { fetchGitHubProfile, GitHubError: errors.GitHubError, isValidUsername: username.isValidUsername };
});

const { getPlayer } = await import("./index");
const { profileCache, profileCacheKey } = await import("@/lib/cache");
const { GitHubError } = await import("@/lib/github/errors");

describe("getPlayer", () => {
  beforeEach(async () => {
    fetchGitHubProfile.mockReset();
    await profileCache.delete(profileCacheKey("octocat"));
  });

  it("rejects invalid usernames without calling GitHub", async () => {
    const r = await getPlayer("-bad-");
    expect(r).toMatchObject({ ok: false, error: { code: "INVALID_USERNAME", status: 400 } });
    expect(fetchGitHubProfile).not.toHaveBeenCalled();
  });

  it("shares one GitHub call between concurrent callers, then serves from cache", async () => {
    fetchGitHubProfile.mockResolvedValue(makeProfile({ login: "octocat" }));
    const [a, b] = await Promise.all([getPlayer("octocat"), getPlayer("OctoCat")]);
    expect(fetchGitHubProfile).toHaveBeenCalledTimes(1);
    expect(a).toMatchObject({ ok: true, cacheHit: false });
    expect(b).toMatchObject({ ok: true, cacheHit: false });

    const c = await getPlayer("octocat");
    expect(c).toMatchObject({ ok: true, cacheHit: true });
    expect(fetchGitHubProfile).toHaveBeenCalledTimes(1);
  });

  it("caches the raw profile under profile:v1 and rates it on every read", async () => {
    const profile = makeProfile({ login: "octocat", followers: 42 });
    await profileCache.set("profile:v1:octocat", profile);
    const r = await getPlayer("OctoCat");
    expect(fetchGitHubProfile).not.toHaveBeenCalled();
    expect(r).toMatchObject({ ok: true, cacheHit: true, player: { profile: { followers: 42 } } });
    if (r.ok) expect(r.player.overall).toBeGreaterThanOrEqual(40);
  });

  it("returns typed GitHub errors with retryAfter", async () => {
    fetchGitHubProfile.mockRejectedValue(new GitHubError("RATE_LIMITED", "Slow down", 120));
    const r = await getPlayer("octocat");
    expect(r).toEqual({ ok: false, error: { code: "RATE_LIMITED", status: 429, message: "Slow down", retryAfter: 120 } });
  });

  it("maps unknown failures to INTERNAL", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchGitHubProfile.mockRejectedValue(new Error("boom"));
    const r = await getPlayer("octocat");
    expect(r).toMatchObject({ ok: false, error: { code: "INTERNAL", status: 500 } });
  });
});
