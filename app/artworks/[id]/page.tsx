import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import ArtworkImage from "@/components/ArtworkImage";
import { getArtwork, listArtworks } from "@/lib/artworks";
import { parseId } from "@/lib/http";

// 목업 단계에서는 항상 DB에서 읽어요.
export const dynamic = "force-dynamic";

// 제목(metadata)과 본문에서 같은 작품을 두 번 조회하지 않도록 한 번만 읽어요
const loadArtwork = cache(async (idRaw: string) => {
  const id = parseId(idRaw);
  return id === null ? null : getArtwork(id);
});

export async function generateMetadata(
  props: PageProps<"/artworks/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const art = await loadArtwork(id);
  if (!art) return { title: "작품을 찾을 수 없어요" };

  return {
    title: art.title,
    description: art.description || undefined,
    openGraph: {
      title: art.title,
      description: art.description || undefined,
      images: [
        {
          url: art.imageUrl,
          width: art.imageWidth ?? undefined,
          height: art.imageHeight ?? undefined,
        },
      ],
    },
  };
}

export default async function ArtworkPage(props: PageProps<"/artworks/[id]">) {
  const { id } = await props.params;
  const art = await loadArtwork(id);
  if (!art) notFound();

  // 이전/다음 작품 (목록 순서 기준)
  const all = await listArtworks({});
  const pos = all.findIndex((a) => a.id === art.id);
  const prev = pos > 0 ? all[pos - 1] : null;
  const next = pos >= 0 && pos < all.length - 1 ? all[pos + 1] : null;

  const details = [
    { label: "재료", value: art.medium },
    { label: "크기", value: art.size },
    { label: "제작 연도", value: art.year ? `${art.year}년` : "" },
  ].filter((d) => d.value);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-2 sm:px-6">
      <Link
        href="/artworks"
        className="inline-block py-3 text-sm text-muted underline-offset-8 hover:text-foreground hover:underline"
      >
        작품 목록
      </Link>

      <div className="mt-4 bg-mat p-4 shadow-mat sm:p-8">
        <ArtworkImage
          src={art.imageUrl}
          alt={art.title}
          width={art.imageWidth}
          height={art.imageHeight}
          sizes="(min-width: 1024px) 1000px, 100vw"
          priority
          className="block h-auto w-full"
        />
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_15rem]">
        <div>
          <h1 className="font-serif text-3xl leading-snug sm:text-4xl">{art.title}</h1>
          {art.description && (
            <p className="mt-6 max-w-prose leading-relaxed text-foreground/80">
              {art.description}
            </p>
          )}
          <Link
            href={`/inquiry?artwork=${art.id}`}
            className="mt-8 inline-block border border-foreground px-6 py-3 transition-colors hover:bg-foreground hover:text-background"
          >
            이 작품 문의하기
          </Link>
        </div>

        {(details.length > 0 || art.category) && (
          <dl className="space-y-4 text-sm">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-xs text-muted">{d.label}</dt>
                <dd className="mt-0.5">{d.value}</dd>
              </div>
            ))}
            {art.category && (
              <div>
                <dt className="text-xs text-muted">분류</dt>
                <dd className="mt-0.5">
                  <Link
                    href={`/artworks?category=${art.category.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {art.category.name}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {(prev || next) && (
        <nav
          aria-label="다른 작품"
          className="mt-20 flex justify-between gap-6 border-t border-line pt-8"
        >
          {prev ? (
            <Link href={`/artworks/${prev.id}`} className="group min-w-0">
              <span className="block text-xs text-muted">이전 작품</span>
              <span className="mt-1 block truncate font-serif text-lg underline-offset-4 group-hover:underline">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/artworks/${next.id}`} className="group min-w-0 text-right">
              <span className="block text-xs text-muted">다음 작품</span>
              <span className="mt-1 block truncate font-serif text-lg underline-offset-4 group-hover:underline">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}