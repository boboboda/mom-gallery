import type { Metadata } from "next";
import Link from "next/link";
import ArtworkImage from "@/components/ArtworkImage";

export const metadata: Metadata = { title: "작가 소개" };

// 소개 글은 여기서 고치면 돼요. 한 줄이 한 문단이에요.
// (이전 사이트의 글이에요. 맞춤법과 띄어쓰기만 다듬었어요)
const paragraphs = [
  "저는 65세 요양보호사 일을 하며 틈틈이 그림 그리는 걸 좋아하는 사람입니다.",
  "어릴 때부터 그림을 좋아했지만 형편상 시기를 놓치고, 생활이 바쁘다 보니 못 그렸던 것을 이제라도 즐거운 마음으로 그려보려 합니다.",
  "그림은 그냥 그리고 싶은 사물이든지 상상이든지 그림이 주는 신비로움이 있다고 생각합니다. 무엇이든 하얀 종이 위에 그려낼 수 있다는 것이 너무나 황홀하고 희열이 느껴지는, 그런 것이 저의 그림에 대한 생각입니다.",
];

export default function ArtistPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
      <h1 className="font-serif text-3xl sm:text-4xl">작가 소개</h1>
      <p className="mt-3 text-muted">그림으로 꿈을 그리는 요양보호사</p>

      <div className="mt-14 grid gap-14 md:grid-cols-[1fr_20rem] md:items-start">
        <div className="space-y-8 font-serif text-lg leading-9">
          {paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>

        {/* 대표로 걸어 둔 그림 한 점 (나중에 바꾸고 싶으면 파일명과 크기만 고치면 돼요) */}
        <figure className="md:sticky md:top-8">
          <div className="bg-mat p-3 shadow-mat sm:p-4">
            <ArtworkImage
              src="/works/work-4.jpeg"
              alt="갈대밭"
              width={2679}
              height={2009}
              sizes="(min-width: 768px) 320px, 100vw"
              className="block h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 font-serif text-sm">갈대밭</figcaption>
        </figure>
      </div>

      <div className="mt-20 border-t border-line pt-10">
        <Link
          href="/artworks"
          className="font-serif text-lg underline decoration-accent decoration-2 underline-offset-8 hover:text-accent"
        >
          작품 보기
        </Link>
      </div>
    </main>
  );
}