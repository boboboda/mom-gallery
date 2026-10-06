import type { NextRequest } from "next/server";
import { listArtworks } from "@/lib/artworks";
import { jsonError, jsonPublic, parseId } from "@/lib/http";

// GET /api/v1/artworks?category=<카테고리 id>&featured=true
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const categoryRaw = params.get("category");
  const categoryId = categoryRaw === null ? undefined : parseId(categoryRaw);
  if (categoryId === null) {
    return jsonError("category는 카테고리 id(양의 정수)여야 해요.", 400);
  }

  const featuredRaw = params.get("featured");
  if (featuredRaw !== null && featuredRaw !== "true" && featuredRaw !== "false") {
    return jsonError("featured는 true 또는 false여야 해요.", 400);
  }
  const featured = featuredRaw === null ? undefined : featuredRaw === "true";

  try {
    return jsonPublic(await listArtworks({ categoryId, featured }));
  } catch (error) {
    console.error("[api] artworks", error);
    return jsonError("서버 오류가 발생했어요.", 500);
  }
}