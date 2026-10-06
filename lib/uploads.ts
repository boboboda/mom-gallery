import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// 서버에서는 UPLOAD_DIR 로 볼륨 경로를 지정하고, 없으면 프로젝트의 uploads 폴더를 써요.
// (실행 중에 정해지는 폴더라서 빌드 도구의 파일 추적을 끄는 표시를 붙였어요)
export const UPLOAD_DIR = path.resolve(
  /*turbopackIgnore: true*/ process.env.UPLOAD_DIR ??
    path.join(process.cwd(), "uploads"),
);
export const UPLOAD_URL_PREFIX = "/uploads/";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_EDGE = 2400; // 긴 변 최대 픽셀
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

// 주소로 요청된 파일 이름이 안전한지 (경로 탈출 방지)
const SAFE_NAME = /^[a-zA-Z0-9-]{1,64}\.(webp|jpe?g|png)$/;

export class UploadError extends Error {}

export function isSafeUploadName(name: string): boolean {
  return SAFE_NAME.test(name);
}

export function contentTypeFor(name: string): string {
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function saveImage(
  input: Buffer,
): Promise<{ url: string; width: number; height: number }> {
  if (input.length > MAX_UPLOAD_BYTES) {
    throw new UploadError("사진이 너무 커요. 15MB 이하로 올려 주세요.");
  }

  try {
    // 확장자가 아니라 실제 내용으로 종류를 확인해요 (SVG 같은 건 거부)
    const meta = await sharp(input).metadata();
    if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
      throw new UploadError("JPG, PNG, WebP 사진만 올릴 수 있어요.");
    }

    const { data, info } = await sharp(input)
      .rotate() // 폰 사진의 회전 정보를 반영
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });

    const name = `${randomUUID()}.webp`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name), data, {
      flag: "wx",
    });

    return { url: `${UPLOAD_URL_PREFIX}${name}`, width: info.width, height: info.height };
  } catch (error) {
    if (error instanceof UploadError) throw error;
    console.error("[saveImage]", error);
    throw new UploadError("사진을 처리하지 못했어요. 다른 사진으로 시도해 주세요.");
  }
}

// 우리가 올린 파일만 지워요 (다른 주소나 이전 사진 경로는 건드리지 않아요)
export async function deleteImage(url: string): Promise<void> {
  if (!url.startsWith(UPLOAD_URL_PREFIX)) return;
  const name = url.slice(UPLOAD_URL_PREFIX.length);
  if (!isSafeUploadName(name)) return;

  try {
    await unlink(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}