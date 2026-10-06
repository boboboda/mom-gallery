"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InquiryHandledButton({
  id,
  handled,
}: {
  id: number;
  handled: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handled: !handled }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("저장하지 못했어요. 잠시 후 다시 해 주세요.");
        return;
      }
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
        onClick={toggle}
        disabled={busy}
        className="border border-line px-5 py-2 text-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {handled ? "다시 안 읽음으로" : "확인했어요"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}