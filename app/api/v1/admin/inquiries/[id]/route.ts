import { jsonError, parseId } from "@/lib/http";
import { getSession } from "@/lib/session";
import { setInquiryHandled } from "@/lib/admin-inquiries";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // proxy 는 /admin 화면만 지키므로, API 는 여기서 직접 확인해요.
  if (!(await getSession())) return jsonError("로그인이 필요해요.", 401);

  const id = parseId((await params).id);
  if (id === null) return jsonError("잘못된 문의 번호예요.", 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 형식이 올바르지 않아요.", 400);
  }

  const handled = (body as { handled?: unknown } | null)?.handled;
  if (typeof handled !== "boolean") {
    return jsonError("handled 는 true 또는 false 여야 해요.", 400);
  }

  try {
    const found = await setInquiryHandled(id, handled);
    if (!found) return jsonError("문의를 찾을 수 없어요.", 404);
    return Response.json(
      { ok: true, handled },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[admin inquiry patch]", error);
    return jsonError("서버 오류가 발생했어요.", 500);
  }
}