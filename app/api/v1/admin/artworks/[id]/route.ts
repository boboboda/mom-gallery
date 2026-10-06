import { jsonError, parseId } from "@/lib/http";
import { getSession } from "@/lib/session";
import {
  deleteArtwork,
  parseArtworkForm,
  updateArtwork,
} from "@/lib/admin-artworks";
import { UploadError } from "@/lib/uploads";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  if (!(await getSession())) return jsonError("로그인이 필요해요.", 401);

  const id = parseId((await params).id);
  if (id === null) return jsonError("잘못된 작품 번호예요.", 400);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("요청 형식이 올바르지 않아요.", 400);
  }

  const parsed = parseArtworkForm(form);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  try {
    const found = await updateArtwork(id, parsed.value, parsed.image);
    if (!found) return jsonError("작품을 찾을 수 없어요.", 404);
    return Response.json({ ok: true, id }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof UploadError) return jsonError(error.message, 400);
    console.error("[admin artwork update]", error);
    return jsonError("서버 오류가 발생했어요.", 500);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!(await getSession())) return jsonError("로그인이 필요해요.", 401);

  const id = parseId((await params).id);
  if (id === null) return jsonError("잘못된 작품 번호예요.", 400);

  try {
    const found = await deleteArtwork(id);
    if (!found) return jsonError("작품을 찾을 수 없어요.", 404);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[admin artwork delete]", error);
    return jsonError("서버 오류가 발생했어요.", 500);
  }
}
