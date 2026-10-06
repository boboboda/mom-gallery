// DB 접근은 이 파일을 통해서만 해요.
// 화면과 API는 Prisma를 직접 쓰지 않고 여기 함수만 불러 써요.
import { getPrisma } from "@/lib/prisma";

export type ArtworkDTO = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  year: number | null;
  medium: string;
  size: string;
  featured: boolean;
  category: { id: number; name: string } | null;
  createdAt: string;
};

export type CategoryDTO = {
  id: number;
  name: string;
  artworkCount: number;
};

type ArtworkRow = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  year: number | null;
  medium: string;
  size: string;
  featured: boolean;
  createdAt: Date;
  category: { id: number; name: string } | null;
};

const categorySelect = { select: { id: true, name: true } } as const;

function toArtworkDTO(row: ArtworkRow): ArtworkDTO {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    imageWidth: row.imageWidth,
    imageHeight: row.imageHeight,
    year: row.year,
    medium: row.medium,
    size: row.size,
    featured: row.featured,
    category: row.category,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listArtworks(
  options: { categoryId?: number; featured?: boolean } = {},
): Promise<ArtworkDTO[]> {
  const rows = await getPrisma().artwork.findMany({
    where: { categoryId: options.categoryId, featured: options.featured },
    include: { category: categorySelect },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }, { id: "desc" }],
  });
  return rows.map(toArtworkDTO);
}

export async function getArtwork(id: number): Promise<ArtworkDTO | null> {
  const row = await getPrisma().artwork.findUnique({
    where: { id },
    include: { category: categorySelect },
  });
  return row ? toArtworkDTO(row) : null;
}

export async function listCategories(): Promise<CategoryDTO[]> {
  const rows = await getPrisma().category.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { _count: { select: { artworks: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    artworkCount: row._count.artworks,
  }));
}