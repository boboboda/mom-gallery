import { getPrisma } from "@/lib/prisma";

export const inquiryKindLabel: Record<string, string> = {
  PURCHASE: "작품 구매",
  COMMISSION: "그림 주문",
  OTHER: "기타 문의",
};

export type AdminInquiry = {
  id: number;
  kind: string;
  name: string;
  contact: string;
  message: string;
  artworkId: number | null;
  artworkTitle: string;
  handled: boolean;
  createdAt: string;
};

function toDto(row: {
  id: number;
  kind: string;
  name: string;
  contact: string;
  message: string;
  artworkId: number | null;
  artworkTitle: string;
  handled: boolean;
  createdAt: Date;
}): AdminInquiry {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// 안 읽은 문의가 위로, 그 안에서는 최신순
export async function listInquiries(options: {
  onlyOpen?: boolean;
}): Promise<AdminInquiry[]> {
  const rows = await getPrisma().inquiry.findMany({
    where: options.onlyOpen ? { handled: false } : undefined,
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
  return rows.map(toDto);
}

export async function getInquiry(id: number): Promise<AdminInquiry | null> {
  const row = await getPrisma().inquiry.findUnique({ where: { id } });
  return row ? toDto(row) : null;
}

// 없는 번호면 false
export async function setInquiryHandled(
  id: number,
  handled: boolean,
): Promise<boolean> {
  const result = await getPrisma().inquiry.updateMany({
    where: { id },
    data: { handled },
  });
  return result.count > 0;
}