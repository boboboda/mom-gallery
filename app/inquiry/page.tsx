import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { getArtwork } from "@/lib/artworks";
import { parseId } from "@/lib/http";

export const metadata: Metadata = { title: "문의" };

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function InquiryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.artwork) ? sp.artwork[0] : sp.artwork;
  const id = raw ? parseId(raw) : null;
  const artwork = id === null ? null : await getArtwork(id);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
      <h1 className="font-serif text-3xl sm:text-4xl">문의</h1>
      <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
        마음에 드는 그림이 있거나, 그려 받고 싶은 그림이 있으면 편하게 남겨주세요.
        남겨주신 연락처로 연락드려요.
      </p>

      <div className="mt-12">
        <InquiryForm
          artwork={
            artwork
              ? {
                  id: artwork.id,
                  title: artwork.title,
                  imageUrl: artwork.imageUrl,
                  imageWidth: artwork.imageWidth,
                  imageHeight: artwork.imageHeight,
                }
              : null
          }
        />
      </div>
    </main>
  );
}