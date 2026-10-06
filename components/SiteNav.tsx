"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="주 메뉴" className="flex gap-5 text-sm sm:gap-6">
      {siteConfig.navItems.map((item) => {
        // 작품 상세(/artworks/5)에서도 "작품"이 현재 위치로 표시돼요
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              "py-2 underline-offset-8 transition-colors " +
              (active
                ? "text-foreground underline decoration-accent decoration-2"
                : "text-muted hover:text-foreground")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}