"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArtworkDTO } from "@/lib/artworks";

const MAX_BYTES = 15 * 1024 * 1024;

const fieldClass =
  "w-full border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-accent";

export default function AdminArtworkForm({
  artwork,
  categoryNames,
}: {
  artwork?: ArtworkDTO;
  categoryNames: string[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(artwork?.title ?? "");
  const [description, setDescription] = useState(artwork?.description ?? "");
  const [year, setYear] = useState(artwork?.year?.toString() ?? "");
  const [medium, setMedium] = useState(artwork?.medium ?? "");
  const [size, setSize] = useState(artwork?.size ?? "");
  const [categoryName, setCategoryName] = useState(artwork?.category?.name ?? "");
  const [featured, setFeatured] = useState(artwork?.featured ?? false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // 미리보기 주소는 화면을 떠날 때 정리해요
  const previewRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;

    if (next && next.size > MAX_BYTES) {
      setError("사진이 너무 커요. 15MB 이하로 올려 주세요.");
      event.target.value = "";
      return;
    }

    setError("");
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = next ? URL.createObjectURL(next) : null;
    previewRef.current = url;
    setPreview(url);
    setFile(next);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!artwork && !file) {
      setError("작품 사진을 선택해 주세요.");
      return;
    }

    setBusy(true);
    setError("");

    const body = new FormData();
    body.set("title", title);
    body.set("description", description);
    body.set("year", year);
    body.set("medium", medium);
    body.set("size", size);
    body.set("categoryName", categoryName);
    body.set("featured", String(featured));
    if (file) body.set("image", file);

    try {
      const res = await fetch(
        artwork ? `/api/v1/admin/artworks/${artwork.id}` : "/api/v1/admin/artworks",
        { method: artwork ? "PATCH" : "POST", body },
      );

      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (res.ok) {
        router.push("/admin/artworks");
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "저장하지 못했어요. 잠시 후 다시 해 주세요.");
    } catch {
      setError("네트워크 오류가 발생했어요. 연결을 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  const shownImage = preview ?? artwork?.imageUrl ?? null;

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div>
        <span className="text-sm text-muted">
          작품 사진{artwork ? " (바꿀 때만 선택)" : ""}
        </span>
        {shownImage && (
          <div className="mt-3 border border-line bg-mat p-3">
            {/* 선택한 파일의 미리보기라서 일반 img 를 써요 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shownImage}
              alt="작품 사진 미리보기"
              className="mx-auto max-h-80 w-auto object-contain"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="mt-3 block w-full text-sm file:mr-4 file:border file:border-line file:bg-transparent file:px-4 file:py-2 file:text-sm file:text-foreground hover:file:border-accent"
        />
      </div>

      <label className="block">
        <span className="text-sm text-muted">제목</span>
        <input
          className={fieldClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm text-muted">설명 (선택)</span>
        <textarea
          className="mt-1 min-h-28 w-full resize-y border border-line bg-transparent p-3 text-base outline-none transition-colors focus:border-accent"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
        />
      </label>

      <div className="grid grid-cols-2 gap-x-6 gap-y-7">
        <label className="block">
          <span className="text-sm text-muted">재료 (예: 유화)</span>
          <input
            className={fieldClass}
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            maxLength={50}
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">크기 (예: 50x70cm)</span>
          <input
            className={fieldClass}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            maxLength={50}
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">제작 연도</span>
          <input
            className={fieldClass}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            inputMode="numeric"
            maxLength={4}
            placeholder="2024"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">분류 (예: 풍경화)</span>
          <input
            className={fieldClass}
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            list="category-names"
            maxLength={30}
          />
          <datalist id="category-names">
            {categoryNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        메인 화면 슬라이드에 보여주기
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="border border-line px-6 py-2 text-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {busy ? "저장 중… (사진이 크면 몇 초 걸려요)" : artwork ? "수정 저장" : "작품 등록"}
      </button>
    </form>
  );
}