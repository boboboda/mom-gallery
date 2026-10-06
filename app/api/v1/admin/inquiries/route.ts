import type { NextRequest } from "next/server";
import { jsonError } from "@/lib/http";
import { getSession } from "@/lib/session";
import { listInquiries } from "@/lib/admin-inquiries";

// GET /api/v1/admin/inquiries?open=true — 문의 목록 (로그인 필요)
export async function GET(request: NextRequest) {
  if (!(await getSession())) return jsonError("로그인이 필요해요.", 401);

  const onlyOpen = request.nextUrl.searchParams.get("open") === "true";

  try {
    return Response.json(await listInquiries({ onlyOpen }), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[admin inquiries list]", error);
    return jsonError("서버 오류가 발생했어요.", 500);
  }
}