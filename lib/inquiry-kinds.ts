// 문의 종류. DB 코드(Prisma)가 섞이지 않은 파일이라 브라우저 화면에서도 불러 써도 돼요.
export const inquiryKinds = [
  { value: "PURCHASE", label: "작품 구매" },
  { value: "COMMISSION", label: "그림 주문" },
  { value: "OTHER", label: "기타 문의" },
] as const;

export type InquiryKindValue = (typeof inquiryKinds)[number]["value"];