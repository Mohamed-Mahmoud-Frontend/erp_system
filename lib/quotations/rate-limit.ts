// Process-local MVP limit. Each server instance has its own window;
// a shared store is required before running multiple instances.
const requests = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

export function checkQuotationRateLimit(userId: string, now = Date.now()) {
  for (const [id, entry] of requests) {
    if (entry.resetAt <= now) requests.delete(id);
  }
  const entry = requests.get(userId);
  if (entry && entry.count >= MAX_REQUESTS) {
    return Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  }
  if (!entry && requests.size >= 5_000) return 60;
  requests.set(userId, { count: (entry?.count ?? 0) + 1, resetAt: entry?.resetAt ?? now + WINDOW_MS });
  return 0;
}
