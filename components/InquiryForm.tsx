"use client";

import { useState, type FormEvent } from "react";
import ArtworkImage from "@/components/ArtworkImage";
import { inquiryKinds, type InquiryKindValue } from "@/lib/inquiry-kinds";

export type LinkedArtwork = {
  id: number;
  title: string;
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
};

type Status = "idle" | "sending" | "done";

const placeholders: Record<InquiryKindValue | "NONE", string> = {
  PURCHASE: "구매하고 싶은 작품과 궁금한 점을 적어주세요.",
  COMMISSION: "그려 받고 싶은 그림의 내용, 크기, 원하는 시기를 적어주세요.",
  OTHER: "문의 내용을 적어주세요.",
  NONE: "문의 내용을 적어주세요.",
};

const fieldClass =
  "mt-2 block w-full border border-foreground/25 bg-transparent px-3 py-2.5 text-base text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

export default function InquiryForm({ artwork }: { artwork: LinkedArtwork | null }) {
  const [kind, setKind] = useState<InquiryKindValue | null>(artwork ? "PURCHASE" : null);
  const [linked, setLinked] = useState<LinkedArtwork | null>(artwork);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/v1/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: data.get("name"),
          contact: data.get("contact"),
          message: data.get("message"),
          artworkId: linked?.id ?? null,
          website: data.get("website"), // 사람 눈에 안 보이는 함정 칸
        }),
      });

      if (res.ok) {
        form.reset();
        setKind(null);
        setLinked(null);
        setStatus("done");
        return;
      }

      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "문의를 보내지 못했어요. 잠시 뒤에 다시 시도해주세요.");
    } catch {
      setError("인터넷 연결을 확인하고 다시 시도해주세요.");
    }
    setStatus("idle");
  }

  if (status === "done") {
    return (
      <div role="status" className="border-t border-line pt-10">
        <p className="font-serif text-2xl">문의가 접수됐어요.</p>
        <p className="mt-3 text-foreground/80">
          남겨주신 연락처로 확인하는 대로 연락드릴게요.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 text-sm text-muted underline underline-offset-8 hover:text-foreground"
        >
          다른 문의 남기기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <fieldset>
        <legend className="text-sm text-muted">문의 종류</legend>
        <div className="mt-3 flex flex-wrap gap-x-7 gap-y-2">
          {inquiryKinds.map((k) => (
            <label key={k.value} className="cursor-pointer">
              <input
                type="radio"
                name="kind"
                value={k.value}
                checked={kind === k.value}
                onChange={() => setKind(k.value)}
                required
                className="peer sr-only"
              />
              <span className="block py-1 text-lg text-muted underline-offset-8 transition-colors hover:text-foreground peer-checked:text-foreground peer-checked:underline peer-checked:decoration-accent peer-checked:decoration-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent">
                {k.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {linked && (
        <div className="flex items-center gap-4 border border-line p-3">
          <div className="w-20 shrink-0 bg-mat p-1.5 shadow-mat">
            <ArtworkImage
              src={linked.imageUrl}
              alt={linked.title}
              width={linked.imageWidth}
              height={linked.imageHeight}
              sizes="80px"
              className="block h-auto w-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">문의하는 작품</p>
            <p className="truncate font-serif text-lg">{linked.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setLinked(null)}
            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            빼기
          </button>
        </div>
      )}

      <label className="block">
        <span className="text-sm text-muted">이름</span>
        <input
          name="name"
          type="text"
          required
          maxLength={50}
          autoComplete="name"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="text-sm text-muted">연락처 (전화번호 또는 이메일)</span>
        <input
          name="contact"
          type="text"
          required
          maxLength={100}
          autoComplete="email"
          placeholder="010-0000-0000"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="text-sm text-muted">문의 내용</span>
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={2000}
          rows={7}
          placeholder={placeholders[kind ?? "NONE"]}
          className={fieldClass}
        />
      </label>

      {/* 함정 칸: 사람 눈에는 안 보이고, 자동 프로그램만 채워요 */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-foreground px-10 py-3 text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {status === "sending" ? "보내는 중" : "문의 보내기"}
      </button>
    </form>
  );
}