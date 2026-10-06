import { listCategories } from "@/lib/artworks";
import { jsonError, jsonPublic } from "@/lib/http";

// GET /api/v1/categories — 카테고리 목록 (작품 수 포함)
export async function GET() {
  try {
    return jsonPublic(await listCategories());
  } catch (error) {
    console.error("[api] categories", error);
    return jsonError("서버 오류가 발생했어요.", 500);
  }
}