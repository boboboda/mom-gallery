// 이전 프로젝트에서 가져온 그림 5장 (임시 제목·설명이에요)
export type SampleWork = {
  title: string;
  description: string;
  file: string;
  width: number;
  height: number;
};

export const sampleWorks: SampleWork[] = [
  { title: "광명", description: "산 너머로 해가 떠오르며 빛이 퍼지는 순간을 그렸어요.", file: "work-1.jpeg", width: 2502, height: 1877 },
  { title: "가지 위의 새", description: "앙상한 가지에 앉은 작은 새와 연한 하늘이에요.", file: "work-2.jpeg", width: 2574, height: 1930 },
  { title: "구름 걸린 초록 산", description: "푸른 하늘 아래 초록빛 산등성이가 겹쳐 흘러요.", file: "work-3.jpeg", width: 2505, height: 1879 },
  { title: "갈대밭", description: "바람에 일렁이는 갈대밭 너머로 푸른 산이 이어져요.", file: "work-4.jpeg", width: 2679, height: 2009 },
  { title: "호수에 비친 산", description: "해가 높이 뜬 호수에 산이 잔잔하게 비쳐요.", file: "work-5.jpeg", width: 2668, height: 2001 },
];