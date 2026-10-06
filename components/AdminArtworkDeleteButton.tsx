"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminArtworkDeleteButton({
  id,
  title,
}: {
  id: number;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (busy) return;
    if (
      !window.confirm(
        `"${title}" 작품을 삭제할까요?\n사진도 함께 지워지고 되돌릴 수 없어요.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/admin/artworks/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("삭제하지 못했어요. 잠시 후 다시 해 주세요.");
        return;
      }
      router.push("/admin/artworks");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="text-sm text-red-700 underline underline-offset-8 hover:opacity-70 disabled:opacity-50 dark:text-red-400"
      >
        {busy ? "삭제 중…" : "이 작품 삭제"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}