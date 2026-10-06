import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listArtworks } from "@/lib/artworks";

export const metadata: Metadata = { title: "작품 관리" };
export const dynamic = "force-dynamic";

export default async function AdminArtworksPage() {
  const artworks = await listArtworks({});

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="font-serif text-2xl">작품 관리</h1>
        <Link
          href="/admin/artworks/new"
          className="border border-line px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          새 작품 등록
        </Link>
      </div>

      {artworks.length === 0 ? (
        <p className="text-sm text-muted">등록된 작품이 없어요.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {artworks.map((art) => (
            <li key={art.id}>
              <Link
                href={`/admin/artworks/${art.id}/edit`}
                className="flex items-center gap-4 py-3 transition-colors hover:bg-mat"
              >
                <Image
                  src={art.imageUrl}
                  alt=""
                  width={64}
                  height={64}
                  sizes="64px"
                  className="h-16 w-16 shrink-0 bg-line object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{art.title}</p>
                  <p className="mt-1 truncate text-xs text-muted">
                    {[art.category?.name, art.medium, art.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {art.featured && (
                  <span className="shrink-0 text-xs text-accent">메인</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}