import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 도커 이미지를 작게 만들기 위해, 실행에 필요한 파일만 따로 묶어요
  output: "standalone",
  allowedDevOrigins: ["192.168.0.155"],
};

export default nextConfig;