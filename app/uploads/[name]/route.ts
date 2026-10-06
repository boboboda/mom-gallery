import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  UPLOAD_DIR,
  contentTypeFor,
  isSafeUploadName,
} from "@/lib/uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!isSafeUploadName(name)) return new Response("Not found", { status: 404 });

  try {
        const data = await readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypeFor(name),
        // 파일 이름이 매번 새로 만들어지므로 오래 캐시해도 안전해요
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}