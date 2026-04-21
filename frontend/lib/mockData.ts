import { Stage, StageData } from "@/types/stage";

export const getMockStageData = (query: string, hotel: string): Record<Stage, StageData> => {
  return {
    original: {
      stage: "original",
      title: "Original Profile",
      preview: "Raw Hotel Data Ingested",
      details: {
        query,
        hotel,
        content: {
          description: `${hotel} is a premier property. We offer rooms and amenities.`,
          amenities: ["WiFi", "Pool", "Gym"],
          price: "Contact for rates",
        },
      },
    },
    evaluation: {
      stage: "evaluation",
      title: "AI Evaluation",
      preview: "Score: 41 / 100",
      details: {
        query,
        hotel,
        content: {
          score: 41,
          reasoning: "Missing specific signals required for your query.",
          breakdown: {
            price: 10,
            location: 15,
            amenities: 5,
            reviews: 6,
            audience: 5,
          },
        },
      },
    },
    gap: {
      stage: "gap",
      title: "Gap Analysis",
      preview: "3 Critical Signals Missing",
      details: {
        query,
        hotel,
        content: {
          gaps: [
            "No mention of KLCC view (requested)",
            "Price clarity is low",
            "Audience alignment is generic",
          ],
        },
      },
    },
    optimization: {
      stage: "optimization",
      title: "Content Optimization",
      preview: "+26 Improvement Found",
      details: {
        query,
        hotel,
        isApproved: false,
        content: {
          improvedDescription: `Experience ${hotel} with breathtaking KLCC views. Transparent pricing starts at RM 450/night.`,
          improvements: [
            "Added landmark proximity",
            "Clarified pricing structure",
            "Tailored tone for target audience",
          ],
        },
      },
    },
    validation: {
      stage: "validation",
      title: "AI Validation",
      preview: "98% Confidence Score",
      details: {
        query,
        hotel,
        content: {
          confidence: 0.98,
          status: "Passed quality check",
        },
      },
    },
    result: {
      stage: "result",
      title: "Final Result",
      preview: "Optimized for Agents",
      details: {
        query,
        hotel,
        content: {
          finalScore: 67,
          delta: 26,
          status: "Ready for deployment",
        },
      },
    },
  };
};
