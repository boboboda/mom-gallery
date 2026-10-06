// 문의 저장소. 문의 내용 검사와 DB 저장은 이 파일에서만 해요.
import { parseId } from "@/lib/http";
import { inquiryKinds, type InquiryKindValue } from "@/lib/inquiry-kinds";
import { getPrisma } from "@/lib/prisma";

export type InquiryInput = {
  kind: InquiryKindValue;
  name: string;
  contact: string;
  message: string;
  artworkId: number | null;
};

export type ValidationResult =
  | { ok: true; value: InquiryInput }
  | { ok: false; error: string };

const MAX_NAME = 50;
const MAX_CONTACT = 100;
const MIN_MESSAGE = 5;
const MAX_MESSAGE = 2000;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function fail(error: string): ValidationResult {
  return { ok: false, error };
}

// 이메일이거나, 숫자 9~15자리가 들어 있는 전화번호면 통과
function looksLikeContact(value: string): boolean {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const digits = value.replace(/\D/g, "");
  const isPhone =
    /^[0-9+\-\s()]+$/.test(value) && digits.length >= 9 && digits.length <= 15;
  return isEmail || isPhone;
}

export function validateInquiry(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) return fail("잘못된 요청이에요.");
  const body = raw as Record<string, unknown>;

  const kind = inquiryKinds.find((k) => k.value === body.kind)?.value;
  if (!kind) return fail("문의 종류를 골라주세요.");

  const name = text(body.name);
  if (!name) return fail("이름을 적어주세요.");
  if (name.length > MAX_NAME) return fail(`이름은 ${MAX_NAME}자 이하로 적어주세요.`);

  const contact = text(body.contact);
  if (contact.length > MAX_CONTACT || !looksLikeContact(contact)) {
    return fail("연락받을 전화번호나 이메일을 정확히 적어주세요.");
  }

  const message = text(body.message);
  if (message.length < MIN_MESSAGE) {
    return fail(`문의 내용을 ${MIN_MESSAGE}자 이상 적어주세요.`);
  }
  if (message.length > MAX_MESSAGE) {
    return fail(`문의 내용은 ${MAX_MESSAGE}자 이하로 적어주세요.`);
  }

  // 관련 작품은 선택 사항. 비어 있으면 null
  let artworkId: number | null = null;
  if (body.artworkId !== undefined && body.artworkId !== null && body.artworkId !== "") {
    artworkId = parseId(String(body.artworkId));
    if (artworkId === null) return fail("작품 번호가 올바르지 않아요.");
  }

  return { ok: true, value: { kind, name, contact, message, artworkId } };
}

export async function createInquiry(input: InquiryInput): Promise<{ id: number }> {
  const prisma = getPrisma();

  // 작품 제목은 문의에 같이 저장해요. (나중에 작품이 지워져도 무슨 작품이었는지 알 수 있게)
  // 없는 작품 번호가 오면 작품 없이 저장해요.
  let artworkId: number | null = null;
  let artworkTitle = "";
  if (input.artworkId !== null) {
    const artwork = await prisma.artwork.findUnique({
      where: { id: input.artworkId },
      select: { id: true, title: true },
    });
    if (artwork) {
      artworkId = artwork.id;
      artworkTitle = artwork.title;
    }
  }

  const row = await prisma.inquiry.create({
    data: {
      kind: input.kind,
      name: input.name,
      contact: input.contact,
      message: input.message,
      artworkId,
      artworkTitle,
    },
    select: { id: true },
  });

  return { id: row.id };
}