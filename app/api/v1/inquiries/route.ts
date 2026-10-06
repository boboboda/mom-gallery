import type { NextRequest } from "next/server";
import { jsonError } from "@/lib/http";
import { createInquiry, validateInquiry } from "@/lib/inquiries";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const MAX_BODY_CHARS = 20_000;

// POST /api/v1/inquiries — 문의 접수
export async function POST(request: NextRequest) {
  // 1) 너무 자주 보내면 막기: 한 사람은 10분에 5번, 전체는 1시간에 100번
  const perIp = rateLimit(`inquiry:ip:${getClientIp(request)}`, 5, 10 * 60 * 1000);
  const overall = rateLimit("inquiry:all", 100, 60 * 60 * 1000);
  const blocked = !perIp.ok ? perIp : !overall.ok ? overall : null;
  if (blocked && !blocked.ok) {
    return Response.json(
      { error: "문의를 너무 자주 보내고 있어요. 잠시 뒤에 다시 시도해주세요." },
      {
        status: 429,
        headers: {
          "Retry-After": String(blocked.retryAfterSec),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  // 2) 본문 읽기 (너무 크면 거절)
  const rawText = await request.text();
  if (rawText.length > MAX_BODY_CHARS) return jsonError("내용이 너무 길어요.", 413);

  let body: unknown;
  try {
    body = JSON.parse(rawText);
  } catch {
    return jsonError("잘못된 요청이에요.", 400);
  }

  // 3) 함정 칸: 사람 눈에는 안 보이는 칸인데 값이 들어 있으면 자동 프로그램이에요.
  //    성공한 것처럼 응답만 하고 저장하지 않아요.
  if (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).website === "string" &&
    (body as Record<string, unknown>).website !== ""
  ) {
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  }

  // 4) 내용 검사
  const result = validateInquiry(body);
  if (!result.ok) return jsonError(result.error, 400);

  // 5) 저장
  try {
    await createInquiry(result.value);
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api] inquiry", error);
    return jsonError("서버 오류가 발생했어요. 잠시 뒤에 다시 시도해주세요.", 500);
  }
}