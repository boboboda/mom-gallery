import { jsonError } from "@/lib/http";
import { getPrisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSession } from "@/lib/session";
import { getClientIp } from "@/lib/rate-limit";
import { clearFailures, lockedFor, recordFailure } from "@/lib/login-throttle";

const MAX_BODY = 2_000;
const MAX_FAILURES_PER_IP = 5;
const MAX_FAILURES_PER_USER = 20;

// 없는 아이디일 때도 같은 시간만큼 계산해서, 응답 시간으로 아이디 존재 여부를 알 수 없게 해요.
const DUMMY_HASH = `scrypt$${"00".repeat(16)}$${"00".repeat(64)}`;

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return jsonError("요청이 너무 커요.", 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonError("요청 형식이 올바르지 않아요.", 400);
  }

  const { username, password } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length === 0 ||
    username.length > 30 ||
    password.length === 0 ||
    password.length > 200
  ) {
    return jsonError("아이디와 비밀번호를 입력해 주세요.", 400);
  }

  const ipKey = `ip:${String(getClientIp(request))}`;
  const userKey = `user:${username}`;

  const wait = Math.max(
    lockedFor(ipKey, MAX_FAILURES_PER_IP),
    lockedFor(userKey, MAX_FAILURES_PER_USER),
  );
  if (wait > 0) {
    return Response.json(
      { error: "로그인 시도가 너무 많아요. 잠시 후 다시 해 주세요." },
      {
        status: 429,
        headers: { "Retry-After": String(wait), "Cache-Control": "no-store" },
      },
    );
  }

  try {
    const user = await getPrisma().adminUser.findUnique({ where: { username } });
    const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !ok) {
      recordFailure(ipKey);
      recordFailure(userKey);
      return jsonError("아이디 또는 비밀번호가 맞지 않아요.", 401);
    }

    clearFailures(ipKey);
    clearFailures(userKey);
    await setSession(user.id);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[admin login]", error);
    return jsonError("서버 오류가 발생했어요.", 500);
  }
}