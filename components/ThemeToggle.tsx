"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  // 서버에서는 알 수 없어서, 화면이 뜬 뒤에 현재 상태를 읽어요
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // 저장이 막힌 브라우저에서도 이번 화면은 바뀌어요
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "밝은 화면으로 바꾸기" : "어두운 화면으로 바꾸기"}
      className="rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-foreground hover:text-foreground"
    >
      {theme === null ? "\u00a0\u00a0\u00a0\u00a0" : theme === "dark" ? "라이트" : "다크"}
    </button>
  );
}