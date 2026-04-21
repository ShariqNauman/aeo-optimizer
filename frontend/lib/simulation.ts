import { Stage, StageData } from "@/types/stage";
import { getMockStageData } from "./mockData";

export const simulatePipeline = async (
  query: string,
  hotel: string,
  onStageComplete: (stage: StageData) => void
) => {
  const data = getMockStageData(query, hotel);
  const stages: Stage[] = [
    "original",
    "evaluation",
    "gap",
    "optimization",
    "validation",
    "result",
  ];

  for (const stage of stages) {
    // Random delay between 1.5s and 3s to simulate AI processing
    const delay = Math.random() * 1500 + 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));
    onStageComplete(data[stage]);
  }
};
