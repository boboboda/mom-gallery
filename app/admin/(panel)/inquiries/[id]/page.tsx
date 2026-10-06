import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InquiryHandledButton from "@/components/InquiryHandledButton";
import { getInquiry, inquiryKindLabel } from "@/lib/admin-inquiries";
import { parseId } from "@/lib/http";

export const metadata: Metadata = { title: "문의 상세" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type Props = { params: Promise<{ id: string }> };

export default async function AdminInquiryDetailPage({ params }: Props) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const inquiry = await getInquiry(id);
  if (!inquiry) notFound();

  // 이메일이면 메일, 아니면 전화 링크
  const contactHref = inquiry.contact.includes("@")
    ? `mailto:${inquiry.contact}`
    : `tel:${inquiry.contact.replace(/[^0-9+]/g, "")}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/admin/inquiries"
        className="text-sm text-muted underline-offset-8 hover:text-accent hover:underline"
      >
        ← 문의함
      </Link>

      <h1 className="mt-6 font-serif text-2xl">
        {inquiryKindLabel[inquiry.kind] ?? inquiry.kind}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {dateFormat.format(new Date(inquiry.createdAt))}
        {!inquiry.handled && <span className="text-accent"> · 안 읽음</span>}
      </p>

      <dl className="mt-8 grid grid-cols-[5rem_1fr] gap-y-3 text-sm">
        <dt className="text-muted">이름</dt>
        <dd className="break-words">{inquiry.name}</dd>

        <dt className="text-muted">연락처</dt>
        <dd className="break-all">
          <a
            href={contactHref}
            className="underline underline-offset-4 hover:text-accent"
          >
            {inquiry.contact}
          </a>
        </dd>

        {inquiry.artworkTitle && (
          <>
            <dt className="text-muted">작품</dt>
            <dd className="break-words">
              {inquiry.artworkId ? (
                <Link
                  href={`/artworks/${inquiry.artworkId}`}
                  className="underline underline-offset-4 hover:text-accent"
                >
                  {inquiry.artworkTitle}
                </Link>
              ) : (
                inquiry.artworkTitle
              )}
            </dd>
          </>
        )}
      </dl>

      <section aria-label="문의 내용" className="mt-8 border border-line bg-mat p-5">
        <p className="whitespace-pre-wrap break-words text-sm leading-7">
          {inquiry.message}
        </p>
      </section>

      <div className="mt-8">
        <InquiryHandledButton id={inquiry.id} handled={inquiry.handled} />
      </div>
    </main>
  );
}