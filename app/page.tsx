import Link from "next/link";
import ArtworkImage from "@/components/ArtworkImage";
import HeroSlider, { type HeroSlide } from "@/components/HeroSlider";
import { listArtworks, listCategories } from "@/lib/artworks";
import { parseId } from "@/lib/http";

// 목업 단계에서는 항상 DB에서 읽어요. (나중에 ISR로 바꾸면 집 서버가 꺼져도 페이지가 열려요)
export const dynamic = "force-dynamic";

// 작가 소개글에서 가져온 한 줄이에요. 바꾸고 싶으면 여기만 고치면 돼요.
const QUOTE =
  "무엇이든 하얀 종이 위에 그려낼 수 있다는 것이 너무나 황홀하고 희열이 느껴집니다.";

// 폰에서는 한 줄로, 넓은 화면에서는 벽에 걸린 그림처럼 크기와 높이를 달리 배치해요 (5개 단위로 반복)
const SLOTS = [
  "md:col-span-7",
  "md:col-span-5 md:col-start-8 md:mt-28",
  "md:col-span-5",
  "md:col-span-7 md:col-start-6 md:mt-28",
  "md:col-span-6 md:col-start-4",
];

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

  const slides: HeroSlide[] = featured.slice(0, 5).map((art) => ({
    id: art.id,
    title: art.title,
    imageUrl: art.imageUrl,
    meta: [art.medium, art.year].filter(Boolean).join(", "),
  }));

  return (
    <>
      {/* 분류를 고른 화면에서는 슬라이더와 작가의 말을 숨겨요 */}
      <HeroSlider slides={slides} />

      {slides.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
          <blockquote className="font-serif text-2xl font-light leading-relaxed md:ml-[8.3%] md:max-w-[51rem] md:text-4xl md:leading-[1.65]">
            {QUOTE}
          </blockquote>
          <p className="mt-6 text-sm text-muted md:ml-[8.3%] md:mt-8 md:text-base">
            작가의 말
            <Link
              href="/artist"
              className="ml-4 text-foreground underline decoration-accent decoration-2 underline-offset-[6px]"
            >
              작가 소개 읽기
            </Link>
          </p>
        </section>
      )}

      <main id="works" className="mx-auto max-w-6xl scroll-mt-4 px-4 pb-20 pt-10 sm:px-6 md:pb-32">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-5 md:mb-14">
          <h2 className="font-serif text-2xl md:text-3xl">작품</h2>
          <nav aria-label="분류" className="flex flex-wrap gap-6 text-sm md:gap-7 md:text-base">
            <FilterLink href="/" active={categoryId === undefined} label="전체" />
            {categories.map((category) => (
              <FilterLink
                key={category.id}
                href={`/?category=${category.id}`}
                active={categoryId === category.id}
                label={`${category.name} ${category.artworkCount}`}
              />
            ))}
          </nav>
        </div>

        {artworks.length === 0 ? (
          <p className="py-20 text-center text-muted">등록된 작품이 없어요.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-y-14 md:grid-cols-12 md:items-start md:gap-x-12 md:gap-y-24">
            {artworks.map((art, i) => (
              <li key={art.id} className={SLOTS[i % SLOTS.length]}>
                <Link href={`/artworks/${art.id}`} className="group block">
                  <ArtworkImage
                    src={art.imageUrl}
                    alt={art.title}
                    width={art.imageWidth}
                    height={art.imageHeight}
                    sizes="(min-width: 768px) 55vw, 100vw"
                    className="h-auto w-full shadow-mat"
                  />
                  <p className="mt-4 font-serif text-lg group-hover:underline md:text-xl">
                    {art.title}
                  </p>
                  <p className="text-sm text-muted">
                    {[art.medium, art.year].filter(Boolean).join(", ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8 px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl leading-snug md:text-3xl">
              마음에 드는 그림이 있으셨나요?
            </h2>
            <p className="mt-3 text-muted">구입이나 전시에 대해 궁금한 점을 남겨 주세요.</p>
          </div>
          <Link
            href="/inquiry"
            className="rounded-full border border-foreground px-9 py-4 transition-colors hover:bg-foreground hover:text-background max-md:w-full max-md:text-center"
          >
            문의 남기기
          </Link>
        </div>
      </section>
    </>
  );
}

function FilterLink({
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
        active
          ? "text-foreground underline decoration-accent decoration-2 underline-offset-[10px]"
          : "text-muted transition-colors hover:text-foreground"
      }
    >
      {label}
    </Link>
  );
}