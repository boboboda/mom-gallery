"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type HeroSlide = {
  id: number;
  title: string;
  imageUrl: string;
  meta: string;
};

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const startX = useRef<number | null>(null);

  // 첫 화면이 그려진 다음에 확대를 시작해야 첫 장도 천천히 확대돼요
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (slides.length === 0) return null;

  const count = slides.length;
  const next = () => setIndex((i) => (i + 1) % count);
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="대표 작품"
      className="relative h-[calc(100svh-5rem)] min-h-[26rem] touch-pan-y overflow-hidden bg-foreground/10"
      // 진짜 마우스를 올렸을 때만 멈춰요. (폰은 한 번 누르면 "올림"으로 처리돼서 멈춘 채로 남아요)
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setPaused(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setPaused(false);
      }}
      // 키보드로 이동해서 포커스가 갔을 때만 멈춰요
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setPaused(true);
      }}
      onBlur={() => setPaused(false)}
      onPointerDown={(e) => {
        startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      {slides.map((slide, i) => {
        const active = i === index;
        const zoomed = ready && active;
        return (
          <div
            key={slide.id}
            aria-hidden={!active}
            className={
              "absolute inset-0 transition-opacity duration-[1600ms] ease-in-out motion-reduce:transition-none " +
              (active ? "opacity-100" : "opacity-0")
            }
          >
            {/* 천천히 확대 (사라진 뒤에 원래 크기로 돌아가요) */}
            <div
              className={
                "absolute inset-0 transition-transform motion-reduce:transform-none " +
                (zoomed
                  ? "scale-[1.08] duration-[9000ms] ease-linear"
                  : "scale-100 duration-0 delay-[1600ms]")
              }
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
              />
            </div>

            {/* 글씨가 놓이는 아래쪽에만 옅은 그늘 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

            <div
              className={
                "absolute bottom-20 left-4 right-4 text-white sm:bottom-24 sm:left-10 " +
                (active ? "hero-rise" : "")
              }
            >
              <h2 className="font-serif text-4xl leading-tight sm:text-6xl">{slide.title}</h2>
              {slide.meta && <p className="mt-2 text-sm text-white/80">{slide.meta}</p>}
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <div className="absolute bottom-4 left-4 right-4 flex gap-3 sm:bottom-6 sm:left-10">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번째 작품 보기: ${slide.title}`}
              aria-current={i === index}
              className="group max-w-24 flex-1 py-3"
            >
              <span className="relative block h-0.5 overflow-hidden bg-white/35">
                {i === index && (
                  <span
                    key={index}
                    className="hero-progress absolute inset-0 origin-left scale-x-100 bg-white"
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                    onAnimationEnd={next}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}