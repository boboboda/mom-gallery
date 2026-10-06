# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# prisma 명령(마이그레이션)이 openssl 을 필요로 해요
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# 1) 의존성 설치
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 2) 빌드 (마이그레이션·관리자 계정 만들기 같은 도구도 이 단계 이미지를 써요)
FROM deps AS builder
# 정적 페이지(robots.txt 등)에 공개 주소가 박히므로 빌드할 때도 필요해요
ARG SITE_URL
ENV SITE_URL=${SITE_URL}
# prisma generate / next build 용 임시 주소예요. 실제 DB 에는 접속하지 않아요.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
COPY . .
RUN npx prisma generate
RUN npm run build

# 3) 실행용 (가장 작은 이미지, root 가 아닌 사용자로 실행)
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    UPLOAD_DIR=/app/uploads

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs \
 && mkdir -p /app/uploads \
 && chown nextjs:nodejs /app/uploads

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]