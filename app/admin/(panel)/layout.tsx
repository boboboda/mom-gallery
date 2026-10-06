import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "관리자", template: "%s | 관리자" },
  robots: { index: false, follow: false },
};

const linkClass =
  "py-2 text-sm text-muted underline-offset-8 transition-colors hover:text-accent hover:underline";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // proxy 와는 별개로, 화면에서도 한 번 더 확인해요.
  if (!(await getSession())) redirect("/admin/login");

  return (
    <>
      <div className="border-b border-line">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
          <nav aria-label="관리자 메뉴" className="flex gap-5 sm:gap-6">
            <Link href="/admin" className={linkClass}>
              홈
            </Link>
            <Link href="/admin/artworks" className={linkClass}>
              작품
            </Link>
            <Link href="/admin/inquiries" className={linkClass}>
              문의
            </Link>
            <Link href="/" className={linkClass}>
              사이트 보기
            </Link>
          </nav>
          <AdminLogoutButton />
        </div>
      </div>
      {children}
    </>
  );
}