import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

// 크기 정보가 없는 작품을 위한 기본 비율 (4:5 세로)
const FALLBACK_WIDTH = 800;
const FALLBACK_HEIGHT = 1000;

export default function ArtworkImage({
  src,
  alt,
  width,
  height,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  className,
}: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? FALLBACK_WIDTH}
      height={height ?? FALLBACK_HEIGHT}
      sizes={sizes}
      priority={priority}
      // SVG는 최적화 대상이 아니라서 그대로 내보내요 (목업 이미지용)
      unoptimized={src.endsWith(".svg")}
      className={className}
    />
  );
}