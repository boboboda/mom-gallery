import { getPrisma } from "@/lib/prisma";

export type AdminStats = {
  artworkCount: number;
  featuredCount: number;
  unhandledInquiryCount: number;
  recentInquiries: {
    id: number;
    kind: string;
    name: string;
    artworkTitle: string;
    handled: boolean;
    createdAt: string;
  }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const prisma = getPrisma();

  const [artworkCount, featuredCount, unhandledInquiryCount, recent] =
    await Promise.all([
      prisma.artwork.count(),
      prisma.artwork.count({ where: { featured: true } }),
      prisma.inquiry.count({ where: { handled: false } }),
      prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          kind: true,
          name: true,
          artworkTitle: true,
          handled: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    artworkCount,
    featuredCount,
    unhandledInquiryCount,
    recentInquiries: recent.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}