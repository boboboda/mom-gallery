import { getAdminStats } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

const kindLabel: Record<string, string> = {
  PURCHASE: "작품 구매",
  COMMISSION: "그림 주문",
  OTHER: "기타 문의",
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line bg-mat px-4 py-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl">{value}</p>
    </div>
  );
}

export default async function AdminHomePage() {
  const stats = await getAdminStats();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 font-serif text-2xl">관리자</h1>

      <section aria-label="현황" className="grid grid-cols-3 gap-3">
        <Stat label="전체 작품" value={stats.artworkCount} />
        <Stat label="메인 노출" value={stats.featuredCount} />
        <Stat label="미확인 문의" value={stats.unhandledInquiryCount} />
      </section>

      <section aria-labelledby="recent-title" className="mt-12">
        <h2 id="recent-title" className="mb-4 font-serif text-lg">
          최근 문의
        </h2>

        {stats.recentInquiries.length === 0 ? (
          <p className="text-sm text-muted">아직 받은 문의가 없어요.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {stats.recentInquiries.map((item) => (
              <li key={item.id} className="flex items-baseline gap-3 py-3">
                <span className="w-20 shrink-0 text-xs text-muted">
                  {kindLabel[item.kind] ?? item.kind}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {item.name}
                  {item.artworkTitle && (
                    <span className="text-muted"> · {item.artworkTitle}</span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {dateFormat.format(new Date(item.createdAt))}
                </span>
                {!item.handled && (
                  <span
                    className="shrink-0 text-xs text-accent"
                    aria-label="아직 확인하지 않은 문의"
                  >
                    ●
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}