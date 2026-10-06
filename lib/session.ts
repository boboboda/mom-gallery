import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
} from "@/lib/session-token";

export async function setSession(userId: number): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true, // 자바스크립트로 쿠키를 못 읽게
    sameSite: "lax", // 다른 사이트에서 날아오는 요청에 쿠키가 안 붙게
    secure: process.env.NODE_ENV === "production", // 운영(HTTPS)에서만 전송
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<{ uid: number } | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}