// 간단한 요청 횟수 제한 (서버 메모리에 저장해요).
// 서버를 다시 켜면 초기화되고, 서버가 여러 대면 대마다 따로 세요. 집 서버 한 대에는 충분해요.
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // 지난 기록 정리 (맵이 계속 커지지 않게)
  if (buckets.size > 1000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}

// 요청한 사람의 주소. Cloudflare 같은 프록시 뒤에서 쓰는 헤더를 우선 봐요.
// (프록시 없이 인터넷에 바로 열어 두면 이 헤더는 속일 수 있어요. 그래서 아래 API에는 전체 제한도 같이 걸어요)
export function getClientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}