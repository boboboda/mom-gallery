import { jsonError } from "@/lib/http";
import { getSession } from "@/lib/session";
import { createArtwork, parseArtworkForm } from "@/lib/admin-artworks";
import { UploadError } from "@/lib/uploads";

export async function POST(request: Request) {
  // proxy 는 /admin 화면만 지키므로, API 는 여기서 직접 확인해요.
  if (!(await getSession())) return jsonError("로그인이 필요해요.", 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("요청 형식이 올바르지 않아요.", 400);
  }

  const parsed = parseArtworkForm(form);
  if (!parsed.ok) return jsonError(parsed.error, 400);
  if (!parsed.image) return jsonError("작품 사진을 선택해 주세요.", 400);

  try {
    const id = await createArtwork(parsed.value, parsed.image);
    return Response.json(
      { ok: true, id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof UploadError) return jsonError(error.message, 400);
    console.error("[admin artwork create]", error);
    return jsonError("서버 오류가 발생했어요.", 500);
  }
}
