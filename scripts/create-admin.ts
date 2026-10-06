import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "../lib/password";

// 입력이 화면에 보이지 않게 한 줄 받기
function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      console.error("터미널에서 직접 실행해 주세요.");
      process.exit(1);
    }

    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let input = "";
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n" || char === "\u0004") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(input);
          return;
        }
        if (char === "\u0003") {
          process.stdout.write("\n");
          process.exit(1);
        }
        if (char === "\u007f" || char === "\b") {
          input = input.slice(0, -1);
          continue;
        }
        input += char;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const username = process.argv[2]?.trim();
  if (!username || username.length < 3 || username.length > 30) {
    console.error("사용법: npm run admin:create -- <아이디(3~30자)>");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL이 설정되지 않았어요.");

  const password = await askHidden("비밀번호 (10자 이상): ");
  if (password.length < 10) {
    console.error("비밀번호는 10자 이상이어야 해요.");
    process.exit(1);
  }
  const again = await askHidden("비밀번호 한 번 더: ");
  if (password !== again) {
    console.error("두 비밀번호가 달라요.");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const passwordHash = await hashPassword(password);
    // 같은 아이디가 있으면 비밀번호만 바꿔요 (비밀번호 재설정 용도)
    const saved = await prisma.adminUser.upsert({
      where: { username },
      update: { passwordHash },
      create: { username, passwordHash },
    });
    console.log(`관리자 계정 저장 완료: ${saved.username} (id ${saved.id})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});