type Bucket = { failures: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000; // 15분
const buckets = new Map<string, Bucket>();

function getBucket(key: string): Bucket | null {
  const bucket = buckets.get(key);
  if (!bucket) return null;
  if (bucket.resetAt <= Date.now()) {
    buckets.delete(key);
    return null;
  }
  return bucket;
}

// 막혀 있으면 남은 초, 아니면 0
export function lockedFor(key: string, maxFailures: number): number {
  const bucket = getBucket(key);
  if (!bucket || bucket.failures < maxFailures) return 0;
  return Math.ceil((bucket.resetAt - Date.now()) / 1000);
}

export function recordFailure(key: string): void {
  const bucket = getBucket(key);
  if (bucket) {
    bucket.failures += 1;
  } else {
    buckets.set(key, { failures: 1, resetAt: Date.now() + WINDOW_MS });
  }

  // 오래된 기록 정리 (메모리가 계속 늘지 않게)
  if (buckets.size > 5000) {
    const now = Date.now();
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }
}

export function clearFailures(key: string): void {
  buckets.delete(key);
}