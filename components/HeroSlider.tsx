"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";

export type HeroSlide = {
  id: number;
  title: string;
  imageUrl: string;
  meta: string;
};

type LayerState = "active" | "under" | "hidden";

// 들어오는 그림은 오른쪽에서 장막처럼 걷히고(1.4초), 확대된 상태에서 천천히 물러나요(9초).
// 직전 그림은 그 밑에 남아 있어서 전환 중에 깜빡이지 않아요.
function layerStyle(state: LayerState): CSSProperties {
  if (state === "hidden") {
    return {
      zIndex: 0,
      clipPath: "inset(0 0 0 100%)",
      transform: "scale(1.12)",
      transition: "none",
    };
  }
  return {
    zIndex: state === "active" ? 2 : 1,
    clipPath: "inset(0 0 0 0)",
    transform: "scale(1)",
    transition:
      "clip-path 1.4s cubic-bezier(0.76,0,0.24,1), transform 9s cubic-bezier(0.2,0.6,0.3,1)",
  };
}

// 그림이 자리를 잡은 뒤(0.8초)에 제목이 아래에서 올라와요.
function captionStyle(active: boolean): CSSProperties {
  return active
    ? {
        opacity: 1,
        transform: "translateY(0)",
        transition:
          "opacity 1s ease 0.8s, transform 1.1s cubic-bezier(0.2,0.7,0.2,1) 0.8s",
      }
    : {
        opacity: 0,
        transform: "translateY(28px)",
        transition: "opacity 0.5s ease, transform 0s 0.5s",
      };
}

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [pos, setPos] = useState({ index: 0, prev: -1 });
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);

  if (slides.length === 0) return null;

  const count = slides.length;
  const { index, prev } = pos;

  const goTo = (to: number) =>
    setPos((p) => (p.index === to ? p : { index: to, prev: p.index }));
  const next = () => goTo((index + 1) % count);
  const move = (delta: number) => goTo((index + delta + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="대표 작품"
      className="relative overflow-hidden bg-[#101412] md:h-[calc(100svh-5rem)] md:min-h-[34rem]"
      // 진짜 마우스를 올렸을 때만 멈춰요. (폰은 한 번 누르면 "올림"으로 처리돼서 멈춘 채로 남아요)
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setPaused(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setPaused(false);
      }}
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setPaused(true);
      }}
      onBlur={() => setPaused(false)}
    >
      {/* 폰: 같은 그림을 흐리게 깔아 분위기만 이어가요 (데스크톱에서는 숨김) */}
      <div aria-hidden="true" className="absolute inset-0 md:hidden">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="hero-motion absolute inset-0"
            style={{ opacity: i === index ? 1 : 0, transition: "opacity 1.2s ease" }}
          >
            <Image
              src={slide.imageUrl}
              alt=""
              fill
              sizes="40vw"
              quality={40}
              className="scale-125 object-cover blur-2xl brightness-50"
            />
          </div>
        ))}
      </div>

      {/* 그림 영역: 폰에서는 원본 비율(4:3) 그대로 전부 보이고, 데스크톱에서는 화면 가득 채워요 */}
      <div
        className="relative isolate aspect-[4/3] touch-pan-y overflow-hidden md:absolute md:inset-0 md:aspect-auto"
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
        }}
      >
        {slides.map((slide, i) => {
          const state: LayerState =
            i === index ? "active" : i === prev ? "under" : "hidden";
          return (
            <div
              key={slide.id}
              aria-hidden={i !== index}
              className="hero-motion absolute inset-0 will-change-[clip-path,transform]"
              style={layerStyle(state)}
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
          );
        })}
      </div>

      {/* 데스크톱: 글씨가 놓이는 아래쪽에만 옅은 그늘 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-2/5 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:block" />

      {/* 작품 설명 카드 */}
      <div className="relative z-20 px-5 pb-2 pt-6 text-white md:absolute md:bottom-20 md:left-10 md:max-w-[40rem] md:p-0">
        <div className="grid">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              aria-hidden={i !== index}
              className="hero-motion col-start-1 row-start-1"
              style={captionStyle(i === index)}
            >
              <Link
                href={`/artworks/${slide.id}`}
                tabIndex={i === index ? 0 : -1}
                className="font-serif text-3xl font-light leading-tight underline-offset-8 hover:underline sm:text-5xl md:text-6xl"
              >
                {slide.title}
              </Link>
              {slide.meta && (
                <p className="mt-2 text-sm text-white/80 md:mt-4 md:text-base">
                  {slide.meta}
                </p>
              )}
            </div>
          ))}
        </div>
        <a
          href="#works"
          className="mt-6 inline-block text-sm text-white underline underline-offset-8 md:mt-7 md:text-base"
        >
          전체 작품 보기
        </a>
      </div>

      {/* 작은 그림 버튼: 현재 그림 밑의 선이 7초 동안 차오르고, 끝나면 다음 그림으로 넘어가요 */}
      {count > 1 && (
        <div className="relative z-20 flex gap-3 px-5 pb-10 pt-4 md:absolute md:bottom-20 md:right-10 md:p-0">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="relative h-14 flex-1 md:h-[69px] md:w-[92px] md:flex-none"
            >
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}번째 작품 보기: ${slide.title}`}
                aria-current={i === index}
                className={
                  "block h-full w-full overflow-hidden border-2 transition-opacity " +
                  (i === index
                    ? "border-white opacity-100"
                    : "border-transparent opacity-55 hover:opacity-90")
                }
              >
                <span className="relative block h-full w-full">
                  <Image
                    src={slide.imageUrl}
                    alt=""
                    fill
                    sizes="92px"
                    className="object-cover"
                  />
                </span>
              </button>
              <span className="pointer-events-none absolute -bottom-2.5 left-0 h-0.5 w-full overflow-hidden">
                {i === index && (
                  <span
                    key={index}
                    className="hero-progress absolute inset-0 origin-left scale-x-100 bg-white"
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                    onAnimationEnd={next}
                  />
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}