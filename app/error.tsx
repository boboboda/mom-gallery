"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-24 text-center sm:py-32">
      <h1 className="font-serif text-2xl">잠시 문제가 생겼어요</h1>
      <p className="mt-4 text-sm text-muted">
        잠시 후 다시 시도해 주세요. 계속 안 되면 나중에 다시 들러 주세요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 border border-line px-5 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
      >
        다시 시도
      </button>
    </main>
  );
}