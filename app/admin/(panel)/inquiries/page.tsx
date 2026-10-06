import type { Metadata } from "next";
import Link from "next/link";
import { inquiryKindLabel, listInquiries } from "@/lib/admin-inquiries";

export const metadata: Metadata = { title: "문의함" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminInquiriesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const onlyOpen = sp.status === "open";
  const items = await listInquiries({ onlyOpen });

  const filterClass = (active: boolean) =>
    "py-2 text-sm underline-offset-8 transition-colors hover:text-accent " +
    (active ? "text-accent underline" : "text-muted hover:underline");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-6 font-serif text-2xl">문의함</h1>

      <nav aria-label="문의 필터" className="mb-6 flex gap-5">
        <Link
          href="/admin/inquiries"
          aria-current={!onlyOpen ? "page" : undefined}
          className={filterClass(!onlyOpen)}
        >
          전체
        </Link>
        <Link
          href="/admin/inquiries?status=open"
          aria-current={onlyOpen ? "page" : undefined}
          className={filterClass(onlyOpen)}
        >
          안 읽은 문의
        </Link>
      </nav>

      {items.length === 0 ? (
        <p className="text-sm text-muted">
          {onlyOpen ? "안 읽은 문의가 없어요." : "아직 받은 문의가 없어요."}
        </p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/inquiries/${item.id}`}
                className="block py-4 transition-colors hover:bg-mat"
              >
                <div className="flex items-baseline gap-3">
                  <span className="w-20 shrink-0 text-xs text-muted">
                    {inquiryKindLabel[item.kind] ?? item.kind}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {item.name}
                    {item.artworkTitle && (
                      <span className="text-muted"> · {item.artworkTitle}</span>
                    )}
                  </span>
                  {!item.handled && (
                    <span
                      className="shrink-0 text-xs text-accent"
                      aria-label="아직 확인하지 않은 문의"
                    >
                      ●
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate pl-[calc(5rem+0.75rem)] text-sm text-muted">
                  {item.message}
                </p>
                <p className="mt-1 pl-[calc(5rem+0.75rem)] text-xs text-muted">
                  {dateFormat.format(new Date(item.createdAt))}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}