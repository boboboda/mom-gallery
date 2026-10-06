import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { sampleWorks } from "./sample-works";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL이 설정되지 않았어요.");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const category = await prisma.category.upsert({
      where: { name: "풍경화" },
      update: { sortOrder: 1 },
      create: { name: "풍경화", sortOrder: 1 },
    });

    // 목업(/mock/)과 이전에 넣은 샘플(/works/)만 지우고 다시 넣어요.
    // 나중에 직접 올린 실제 작품은 건드리지 않아요.
    const removed = await prisma.artwork.deleteMany({
      where: {
        OR: [
          { imageUrl: { startsWith: "/mock/" } },
          { imageUrl: { startsWith: "/works/" } },
        ],
      },
    });

    for (const [index, work] of sampleWorks.entries()) {
      await prisma.artwork.create({
        data: {
          title: work.title,
          description: work.description,
          imageUrl: `/works/${work.file}`,
          imageWidth: work.width,
          imageHeight: work.height,
          year: 2024,
          medium: "유화",
          size: "",
          featured: true,
          sortOrder: index,
          categoryId: category.id,
        },
      });
    }

    // 작품이 하나도 없는 카테고리는 정리
    const emptied = await prisma.category.deleteMany({
      where: { artworks: { none: {} } },
    });

    console.log(
      `시드 완료: 작품 ${sampleWorks.length}개 (기존 ${removed.count}개 교체, 빈 카테고리 ${emptied.count}개 정리)`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});