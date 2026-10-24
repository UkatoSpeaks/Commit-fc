import { getPlayer } from "@/lib/player";

interface Context {
  params: Promise<{ username: string }>;
}

export async function GET(_req: Request, ctx: Context): Promise<Response> {
  const { username } = await ctx.params;
  const result = await getPlayer(username);

  if (result.ok) {
    return Response.json(result.player, { headers: { "X-Cache": result.cacheHit ? "HIT" : "MISS" } });
  }

  const { code, status, message, retryAfter } = result.error;
  const headers = retryAfter === undefined ? undefined : { "Retry-After": String(retryAfter) };
  return Response.json({ error: { code, message } }, { status, headers });
}
