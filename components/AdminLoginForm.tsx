"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const fieldClass =
  "w-full border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-accent";

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "로그인하지 못했어요. 잠시 후 다시 해 주세요.");
    } catch {
      setError("네트워크 오류가 발생했어요. 연결을 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block">
        <span className="text-sm text-muted">아이디</span>
        <input
          className={fieldClass}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          maxLength={30}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm text-muted">비밀번호</span>
        <input
          className={fieldClass}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          maxLength={200}
          required
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="border border-line px-5 py-2 text-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {busy ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}