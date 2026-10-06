import type { Metadata } from "next";
import Link from "next/link";
import ArtworkImage from "@/components/ArtworkImage";
import { listArtworks, listCategories, type ArtworkDTO } from "@/lib/artworks";
import { parseId } from "@/lib/http";

export const metadata: Metadata = { title: "작품" };

// 목업 단계에서는 항상 DB에서 읽어요. (나중에 ISR로 바꾸면 집 서버가 꺼져도 페이지가 열려요)
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ArtworksPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categoryRaw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const categoryId = categoryRaw ? (parseId(categoryRaw) ?? undefined) : undefined;

  const [categories, artworks] = await Promise.all([
    listCategories(),
    listArtworks({ categoryId }),
  ]);

  const total = categories.reduce((sum, c) => sum + c.artworkCount, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
      <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="font-serif text-3xl">작품</h1>
        <nav aria-label="카테고리" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <FilterLink href="/artworks" active={categoryId === undefined} label="전체" count={total} />
          {categories.map((category) => (
            <FilterLink
              key={category.id}
              href={`/artworks?category=${category.id}`}
              active={categoryId === category.id}
              label={category.name}
              count={category.artworkCount}
            />
          ))}
        </nav>
      </div>

      {artworks.length === 0 ? (
        <p className="py-24 text-center text-muted">이 카테고리에는 아직 작품이 없어요.</p>
      ) : (
        <ul className="columns-1 gap-x-10 sm:columns-2 lg:columns-3">
          {artworks.map((art, i) => (
            <li key={art.id} className="mb-14 break-inside-avoid">
              <Framed art={art} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

// 하얀 매트에 끼운 그림 + 아래 벽 라벨
function Framed({ art, priority = false }: { art: ArtworkDTO; priority?: boolean }) {
  const meta = [art.medium, art.size, art.year ? `${art.year}년` : ""]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/artworks/${art.id}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <div className="bg-mat p-3 shadow-mat sm:p-5">
        <ArtworkImage
          src={art.imageUrl}
          alt={art.title}
          width={art.imageWidth}
          height={art.imageHeight}
          priority={priority}
          className="block h-auto w-full"
        />
      </div>
      <p className="mt-4 font-serif text-base leading-snug underline-offset-4 group-hover:underline">
        {art.title}
      </p>
      {meta && <p className="mt-1 text-xs text-muted">{meta}</p>}
    </Link>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "underline-offset-8 transition-colors " +
        (active
          ? "text-foreground underline decoration-accent decoration-2"
          : "text-muted hover:text-foreground")
      }
    >
      {label}
      <span className="ml-1 text-xs text-muted">{count}</span>
    </Link>
  );
}