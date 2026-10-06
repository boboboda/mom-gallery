import Link from "next/link";
import ArtworkImage from "@/components/ArtworkImage";
import { listArtworks, listCategories } from "@/lib/artworks";
import { parseId } from "@/lib/http";

// 목업 단계에서는 항상 DB에서 읽어요. (나중에 ISR로 바꾸면 집 서버가 꺼져도 페이지가 열려요)
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const categoryRaw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const categoryId = categoryRaw ? (parseId(categoryRaw) ?? undefined) : undefined;

  const [categories, artworks, featured] = await Promise.all([
    listCategories(),
    listArtworks({ categoryId }),
    categoryId === undefined ? listArtworks({ featured: true }) : Promise.resolve([]),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {featured.length > 0 && (
        <section aria-labelledby="featured-title" className="mb-10">
          <h2 id="featured-title" className="mb-3 text-sm font-medium text-muted">
            대표 작품
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featured.slice(0, 4).map((art, i) => (
              <Link
                key={art.id}
                href={`/artworks/${art.id}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-line"
              >
                <ArtworkImage
                  src={art.imageUrl}
                  alt={art.title}
                  width={art.imageWidth}
                  height={art.imageHeight}
                  sizes="(min-width: 640px) 25vw, 50vw"
                  priority={i < 2}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-sm font-medium text-white">
                  {art.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav aria-label="카테고리" className="mb-6 flex flex-wrap gap-2">
        <FilterChip href="/" active={categoryId === undefined} label="전체" />
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            href={`/?category=${category.id}`}
            active={categoryId === category.id}
            label={`${category.name} ${category.artworkCount}`}
          />
        ))}
      </nav>

      {artworks.length === 0 ? (
        <p className="py-20 text-center text-muted">등록된 작품이 없어요.</p>
      ) : (
        <ul className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {artworks.map((art) => (
            <li key={art.id} className="mb-4 break-inside-avoid">
              <Link href={`/artworks/${art.id}`} className="group block">
                <div className="overflow-hidden rounded-lg bg-line">
                  <ArtworkImage
                    src={art.imageUrl}
                    alt={art.title}
                    width={art.imageWidth}
                    height={art.imageHeight}
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 text-sm font-medium">{art.title}</p>
                <p className="text-xs text-muted">
                  {[art.medium, art.year].filter(Boolean).join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "rounded-full border px-3 py-1.5 text-sm transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-line text-muted hover:border-foreground hover:text-foreground")
      }
    >
      {label}
    </Link>
  );
}