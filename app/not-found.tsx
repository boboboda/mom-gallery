import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-24 text-center sm:py-32">
      <p className="text-sm text-muted">404</p>
      <h1 className="mt-3 font-serif text-2xl">찾으시는 페이지가 없어요</h1>
      <p className="mt-4 text-sm text-muted">
        주소가 바뀌었거나 삭제된 작품일 수 있어요.
      </p>
      <div className="mt-8 flex justify-center gap-6 text-sm">
        <Link
          href="/"
          className="py-2 underline underline-offset-8 hover:text-accent"
        >
          처음으로
        </Link>
        <Link
          href="/artworks"
          className="py-2 underline underline-offset-8 hover:text-accent"
        >
          작품 보기
        </Link>
      </div>
    </main>
  );
}