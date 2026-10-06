import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16 sm:py-24">
      <h1 className="mb-10 font-serif text-2xl">관리자 로그인</h1>
      <AdminLoginForm />
    </main>
  );
}