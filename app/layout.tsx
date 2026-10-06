import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-4 sm:px-6 sm:py-6">
            <Link href="/" className="font-serif text-xl tracking-tight">
              {siteConfig.name}
            </Link>
            <SiteNav />
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line py-6 text-center text-sm text-muted">
          © {new Date().getFullYear()} {siteConfig.name}
        </footer>
      </body>
    </html>
  );
}