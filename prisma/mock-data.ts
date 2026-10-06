// 실제 작품을 올리기 전까지 화면을 확인하려고 쓰는 가짜 데이터예요.

export const mockCategories = [
  { name: "풍경화", sortOrder: 1 },
  { name: "정물화", sortOrder: 2 },
  { name: "추상화", sortOrder: 3 },
  { name: "인물화", sortOrder: 4 },
];

export type MockArtwork = {
  title: string;
  description: string;
  category: string;
  medium: string;
  year: number;
  size: string;
  featured: boolean;
  width: number;
  height: number;
  hue: number; // 나중에 만들 자리표시자 이미지의 색상
};

export const mockArtworks: MockArtwork[] = [
  { title: "갈대밭의 아침", description: "이른 아침 갈대밭에 번지는 빛을 그린 작품이에요.", category: "풍경화", medium: "유화", year: 2024, size: "50x70cm", featured: true, width: 800, height: 1000, hue: 35 },
  { title: "바다가 보이는 언덕", description: "언덕 위에서 바라본 잔잔한 바다예요.", category: "풍경화", medium: "수채화", year: 2024, size: "40x60cm", featured: true, width: 1000, height: 800, hue: 200 },
  { title: "겨울 산책길", description: "눈 쌓인 길을 천천히 걷는 느낌을 담았어요.", category: "풍경화", medium: "아크릴", year: 2023, size: "60x80cm", featured: false, width: 800, height: 1100, hue: 210 },
  { title: "봄날의 정원", description: "꽃이 막 피기 시작한 정원의 한 장면이에요.", category: "풍경화", medium: "수채화", year: 2023, size: "30x40cm", featured: false, width: 800, height: 800, hue: 110 },
  { title: "창가의 꽃병", description: "창가에 놓인 꽃병에 오후 햇살이 들어요.", category: "정물화", medium: "유화", year: 2024, size: "40x50cm", featured: true, width: 800, height: 1000, hue: 330 },
  { title: "감과 도자기", description: "가을 감과 오래된 도자기를 나란히 그렸어요.", category: "정물화", medium: "수채화", year: 2022, size: "30x40cm", featured: false, width: 1000, height: 800, hue: 25 },
  { title: "아침 식탁", description: "차려진 아침 식탁의 따뜻한 분위기를 그렸어요.", category: "정물화", medium: "아크릴", year: 2023, size: "50x60cm", featured: false, width: 800, height: 800, hue: 45 },
  { title: "푸른 리듬", description: "푸른 색의 반복으로 리듬을 만든 추상 작품이에요.", category: "추상화", medium: "아크릴", year: 2024, size: "60x60cm", featured: true, width: 800, height: 800, hue: 225 },
  { title: "흩어지는 빛", description: "빛이 흩어지는 순간을 색으로 풀어냈어요.", category: "추상화", medium: "유화", year: 2023, size: "70x90cm", featured: false, width: 800, height: 1100, hue: 290 },
  { title: "바람의 결", description: "바람이 지나간 자리의 결을 붓으로 따라갔어요.", category: "추상화", medium: "수채화", year: 2022, size: "40x60cm", featured: false, width: 1000, height: 800, hue: 170 },
  { title: "책 읽는 사람", description: "조용히 책을 읽는 사람의 옆모습이에요.", category: "인물화", medium: "유화", year: 2024, size: "50x70cm", featured: false, width: 800, height: 1000, hue: 15 },
  { title: "웃는 얼굴", description: "활짝 웃는 얼굴을 따뜻한 색으로 그렸어요.", category: "인물화", medium: "수채화", year: 2023, size: "40x50cm", featured: false, width: 800, height: 1000, hue: 5 },
];

// 목업 이미지 경로 규칙 (index 0 → /mock/mock-01.svg)
export function mockImagePath(index: number): string {
  return `/mock/mock-${String(index + 1).padStart(2, "0")}.svg`;
}