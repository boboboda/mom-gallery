import type { Metadata } from "next";
import Link from "next/link";
import AdminArtworkForm from "@/components/AdminArtworkForm";
import { listCategories } from "@/lib/artworks";

export const metadata: Metadata = { title: "새 작품 등록" };
export const dynamic = "force-dynamic";

export default async function AdminArtworkNewPage() {
  const categories = await listCategories();

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/admin/artworks"
        className="text-sm text-muted underline-offset-8 hover:text-accent hover:underline"
      >
        ← 작품 관리
      </Link>
      <h1 className="mb-8 mt-6 font-serif text-2xl">새 작품 등록</h1>
      <AdminArtworkForm categoryNames={categories.map((c) => c.name)} />
    </main>
  );
}