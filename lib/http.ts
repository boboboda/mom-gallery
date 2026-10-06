// 공개 API 응답 헬퍼. 읽기 전용 응답은 잠깐 캐시해서 집 서버 부담을 줄여요.
const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=300";

export function jsonPublic(data: unknown): Response {
  return Response.json(data, { headers: { "Cache-Control": PUBLIC_CACHE } });
}

export function jsonError(message: string, status: number): Response {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

// 양의 정수 문자열만 허용 ("12" → 12, "abc"·"-1"·"0"·"1e3" → null)
export function parseId(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}