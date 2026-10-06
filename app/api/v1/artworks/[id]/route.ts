import type { NextRequest } from "next/server";
import { getArtwork } from "@/lib/artworks";
import { jsonError, jsonPublic, parseId } from "@/lib/http";

// GET /api/v1/artworks/:id — 작품 1개
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/v1/artworks/[id]">,
) {
  const { id: idRaw } = await ctx.params;
  const id = parseId(idRaw);
  if (id === null) return jsonError("id는 양의 정수여야 해요.", 400);

  try {
    const artwork = await getArtwork(id);
    if (!artwork) return jsonError("작품을 찾을 수 없어요.", 404);
    return jsonPublic(artwork);
  } catch (error) {
    console.error("[api] artwork", error);
    return jsonError("서버 오류가 발생했어요.", 500);
  }
}