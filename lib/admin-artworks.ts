import { getPrisma } from "@/lib/prisma";
import { deleteImage, saveImage } from "@/lib/uploads";

export type ArtworkInput = {
  title: string;
  description: string;
  year: number | null;
  medium: string;
  size: string;
  categoryName: string; // 빈 문자열이면 분류 없음
  featured: boolean;
};

type ParseResult =
  | { ok: true; value: ArtworkInput; image: File | null }
  | { ok: false; error: string };

// 화면에서 보낸 FormData 를 검사해서 정리해요.
export function parseArtworkForm(form: FormData): ParseResult {
  const str = (key: string) => {
    const v = form.get(key);
    return typeof v === "string" ? v.trim() : "";
  };

  const title = str("title");
  if (title.length < 1 || title.length > 100) {
    return { ok: false, error: "제목은 1~100자로 입력해 주세요." };
  }

  const description = str("description");
  if (description.length > 2000) {
    return { ok: false, error: "설명은 2000자 이하로 입력해 주세요." };
  }

  let year: number | null = null;
  const yearRaw = str("year");
  if (yearRaw !== "") {
    if (!/^\d{4}$/.test(yearRaw)) {
      return { ok: false, error: "제작 연도는 4자리 숫자로 입력해 주세요." };
    }
    year = Number(yearRaw);
    if (year < 1900 || year > 2100) {
      return { ok: false, error: "제작 연도를 확인해 주세요." };
    }
  }

  const medium = str("medium");
  const size = str("size");
  const categoryName = str("categoryName");
  if (medium.length > 50) return { ok: false, error: "재료는 50자 이하로 입력해 주세요." };
  if (size.length > 50) return { ok: false, error: "크기는 50자 이하로 입력해 주세요." };
  if (categoryName.length > 30) {
    return { ok: false, error: "분류 이름은 30자 이하로 입력해 주세요." };
  }

  const file = form.get("image");
  const image = file instanceof File && file.size > 0 ? file : null;

  return {
    ok: true,
    value: {
      title,
      description,
      year,
      medium,
      size,
      categoryName,
      featured: form.get("featured") === "true",
    },
    image,
  };
}

async function saveUploadedFile(file: File) {
  return saveImage(Buffer.from(await file.arrayBuffer()));
}

function categoryRelation(name: string) {
  return { connectOrCreate: { where: { name }, create: { name } } };
}

// 작품이 하나도 없는 분류는 정리해요.
async function removeEmptyCategories(): Promise<void> {
  await getPrisma().category.deleteMany({ where: { artworks: { none: {} } } });
}

export async function createArtwork(
  input: ArtworkInput,
  image: File,
): Promise<number> {
  const saved = await saveUploadedFile(image);

  try {
    const row = await getPrisma().artwork.create({
      data: {
        title: input.title,
        description: input.description,
        year: input.year,
        medium: input.medium,
        size: input.size,
        featured: input.featured,
        imageUrl: saved.url,
        imageWidth: saved.width,
        imageHeight: saved.height,
        category: input.categoryName
          ? categoryRelation(input.categoryName)
          : undefined,
      },
    });
    return row.id;
  } catch (error) {
    await deleteImage(saved.url).catch(() => {});
    throw error;
  }
}

// 없는 번호면 false
export async function updateArtwork(
  id: number,
  input: ArtworkInput,
  image: File | null,
): Promise<boolean> {
  const prisma = getPrisma();
  const existing = await prisma.artwork.findUnique({ where: { id } });
  if (!existing) return false;

  const saved = image ? await saveUploadedFile(image) : null;

  try {
    await prisma.artwork.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        year: input.year,
        medium: input.medium,
        size: input.size,
        featured: input.featured,
        category: input.categoryName
          ? categoryRelation(input.categoryName)
          : { disconnect: true },
        ...(saved
          ? {
              imageUrl: saved.url,
              imageWidth: saved.width,
              imageHeight: saved.height,
            }
          : {}),
      },
    });
  } catch (error) {
    if (saved) await deleteImage(saved.url).catch(() => {});
    throw error;
  }

  if (saved) await deleteImage(existing.imageUrl).catch(() => {});
  await removeEmptyCategories();
  return true;
}

// 없는 번호면 false
export async function deleteArtwork(id: number): Promise<boolean> {
  const prisma = getPrisma();
  const existing = await prisma.artwork.findUnique({ where: { id } });
  if (!existing) return false;

  await prisma.artwork.delete({ where: { id } });
  // 직접 올린 사진만 지워져요 (이전 사진 경로는 건드리지 않아요)
  await deleteImage(existing.imageUrl).catch(() => {});
  await removeEmptyCategories();
  return true;
}