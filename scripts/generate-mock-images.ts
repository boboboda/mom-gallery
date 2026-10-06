import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// 목업 작품마다 다른 색 조합 (12개)
const palettes: [string, string, string][] = [
  ["#f6d365", "#fda085", "#8d5524"],
  ["#a1c4fd", "#c2e9fb", "#2c5364"],
  ["#d4fc79", "#96e6a1", "#2f5d3a"],
  ["#fbc2eb", "#a6c1ee", "#5b4b8a"],
  ["#ffecd2", "#fcb69f", "#a0522d"],
  ["#84fab0", "#8fd3f4", "#1f5f5b"],
  ["#e0c3fc", "#8ec5fc", "#3d3a7c"],
  ["#f093fb", "#f5576c", "#6b2d5c"],
  ["#fddb92", "#d1fdff", "#6d5a2c"],
  ["#c3cfe2", "#f5f7fa", "#3b4a6b"],
  ["#ffd1ff", "#fad0c4", "#7a3b3b"],
  ["#89f7fe", "#66a6ff", "#1c3d6e"],
];

const WIDTH = 800;
const HEIGHT = 1000;

function makeSvg(index: number): string {
  const [c1, c2, c3] = palettes[index % palettes.length];
  const label = String(index + 1).padStart(2, "0");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <circle cx="${200 + (index % 4) * 120}" cy="260" r="110" fill="${c3}" opacity="0.25"/>
  <path d="M0 ${700 - (index % 3) * 40} Q 200 ${560 - (index % 5) * 20} 400 ${700 - (index % 3) * 40} T 800 ${680 - (index % 4) * 30} V ${HEIGHT} H 0 Z" fill="${c3}" opacity="0.45"/>
  <path d="M0 ${820 - (index % 4) * 25} Q 250 ${720 - (index % 3) * 20} 500 ${820 - (index % 4) * 25} T 800 ${800 - (index % 3) * 20} V ${HEIGHT} H 0 Z" fill="${c3}" opacity="0.7"/>
  <text x="400" y="${HEIGHT - 60}" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#ffffff" opacity="0.85">mock ${label}</text>
</svg>
`;
}

const outDir = join(process.cwd(), "public", "mock");
mkdirSync(outDir, { recursive: true });

for (let i = 0; i < 12; i++) {
  const name = `mock-${String(i + 1).padStart(2, "0")}.svg`;
  writeFileSync(join(outDir, name), makeSvg(i));
}

console.log(`public/mock 에 이미지 12장을 만들었어요.`);