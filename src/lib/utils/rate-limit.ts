import "server-only";

/**
 * Production rate limiter backed by Upstash Redis (works across all
 * serverless instances, unlike the in-memory fallback in middleware.ts).
 * Uses a simple fixed-window counter via Redis INCR + EXPIRE, exposed
 * through Upstash's REST API so it works in the Edge runtime too.
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 * Falls back to "allow" if not configured, so local dev isn't blocked.
 */
interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function rateLimit(
  identifier: string,
  { limit = 20, windowSeconds = 60 }: { limit?: number; windowSeconds?: number } = {},
): Promise<RateLimitResult> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // Not configured — allow the request through. Configure Upstash before
    // relying on this in production; middleware.ts's in-memory limiter is
    // an interim safety net only.
    return { success: true, remaining: limit, limit };
  }

  const key = `ratelimit:${identifier}`;

  const pipeline = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSeconds.toString(), "NX"],
    ]),
  });

  if (!pipeline.ok) {
    // Fail open rather than taking the whole API down if Redis hiccups.
    return { success: true, remaining: limit, limit };
  }

  const [incrResult] = (await pipeline.json()) as [{ result: number }, { result: number }];
  const count = incrResult.result;

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    limit,
  };
}
