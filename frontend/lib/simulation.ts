import { Stage, StageData } from "@/types/stage";
import { getMockStageData } from "./mockData";

export const simulatePipeline = (
  query: string,
  hotel: string,
  onStageComplete: (stage: StageData) => void
): WebSocket => {
  const ws = new WebSocket("ws://127.0.0.1:8000/ws/optimize");

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        hotel_url: hotel,
        traveller_query: query,
      })
    );
  };

  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);

    if (response.type === "agent_update") {
      const agentName = response.agent;
      const data = response.data;

      let stageData: StageData | null = null;

      if (agentName === "data_aggregation") {
        stageData = {
          stage: "original",
          title: "Original Profile",
          preview: "Raw Hotel Data Ingested",
          details: {
            query,
            hotel,
            content: {
              description:
                data.aggregated_profile?.description || "Ingested data...",
              amenities: data.aggregated_profile?.amenities || [],
              price: "N/A",
            },
          },
        };
      } else if (agentName === "ai_simulator") {
        stageData = {
          stage: "evaluation",
          title: "AI Evaluation",
          preview: `Score: ${data.evaluation_score} / 100`,
          details: {
            query,
            hotel,
            content: {
              score: data.evaluation_score,
              reasoning: data.evaluation_reasoning,
              breakdown: data.sub_scores || {},
            },
          },
        };
      } else if (agentName === "gap_analyzer") {
        stageData = {
          stage: "gap",
          title: "Gap Analysis",
          preview: `${data.gaps?.length || 0} Gaps Found`,
          details: {
            query,
            hotel,
            content: {
              gaps: data.gaps || [],
            },
          },
        };
      } else if (agentName === "optimizer") {
        stageData = {
          stage: "optimization",
          title: "Content Optimization",
          preview: "Profile Updated",
          details: {
            query,
            hotel,
            isApproved: false,
            content: {
              optimizedProfile: data.optimized_profile || {},
              improvedDescription: data.optimized_profile?.description || "",
              improvements: data.optimized_profile?.unique_selling_points || [],
            },
          },
        };
      } else if (agentName === "validator") {
        stageData = {
          stage: "validation",
          title: "AI Validation",
          preview: data.validation_passed ? "Passed QA" : "Retry Needed",
          details: {
            query,
            hotel,
            content: {
              confidence: data.validation_passed ? 0.98 : 0.45,
              status: data.validation_feedback,
            },
          },
        };
      } else if (agentName === "resimulator") {
        stageData = {
          stage: "result",
          title: "Final Result",
          preview: `+${data.score_delta} Improvement`,
          details: {
            query,
            hotel,
            content: {
              finalScore: data.resim_score,
              delta: data.score_delta,
              status: "Ready for deployment",
            },
          },
        };
      }

      if (stageData) {
        onStageComplete(stageData);
      }
    }
  };

  ws.onerror = (error) => {
    // React StrictMode might close the connection immediately on mount/unmount.
    // If the socket is closing or closed, ignore the error.
    if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
      return;
    }
    console.error("WebSocket Error: ", error);
  };

  return ws;
};
