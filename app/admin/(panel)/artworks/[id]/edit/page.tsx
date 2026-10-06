import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminArtworkDeleteButton from "@/components/AdminArtworkDeleteButton";
import AdminArtworkForm from "@/components/AdminArtworkForm";
import { getArtwork, listCategories } from "@/lib/artworks";
import { parseId } from "@/lib/http";

export const metadata: Metadata = { title: "작품 수정" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminArtworkEditPage({ params }: Props) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const [artwork, categories] = await Promise.all([
    getArtwork(id),
    listCategories(),
  ]);
  if (!artwork) notFound();

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/admin/artworks"
        className="text-sm text-muted underline-offset-8 hover:text-accent hover:underline"
      >
        ← 작품 관리
      </Link>
      <h1 className="mb-8 mt-6 font-serif text-2xl">작품 수정</h1>

      <AdminArtworkForm
        artwork={artwork}
        categoryNames={categories.map((c) => c.name)}
      />

      <div className="mt-14 border-t border-line pt-6">
        <AdminArtworkDeleteButton id={artwork.id} title={artwork.title} />
      </div>
    </main>
  );
}