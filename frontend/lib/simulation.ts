import { Stage, StageData } from "@/types/stage";
import { getMockStageData } from "./mockData";

export const simulatePipeline = (
  query: string,
  hotel: string,
  onStageComplete: (stage: StageData) => void
): WebSocket | null => {
  // Check if we should use mock data (e.g. via env var or if you want to bypass backend)
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  if (useMock) {
    simulateMockPipeline(query, hotel, onStageComplete);
    return null;
  }

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

      if (agentName === "web_researcher") {
        stageData = {
          stage: "original",
          title: "Web Research",
          preview: `Found ${data.sources?.length || 0} credible sources.`,
          details: {
            query,
            hotel,
            content: {
              description: "Researching property across the web...",
              sources: data.sources || [],
            },
          },
        };
      } else if (agentName === "data_aggregation") {
        const profile = data.aggregated_profile || {};
        stageData = {
          stage: "original",
          title: "Original Profile",
          preview: profile.name ? `${profile.name} ingested.` : "Raw Hotel Data Ingested",
          details: {
            query,
            hotel,
            content: {
              description: profile.description || "Ingested data...",
              amenities: profile.amenities || [],
              room_types: profile.room_types || [],
              dining_options: profile.dining_options || [],
              unique_selling_points: profile.unique_selling_points || [],
              price: profile.price_range || "N/A",
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
        const opt = data.optimized_profile || {};
        stageData = {
          stage: "optimization",
          title: "Content Optimization",
          preview: "Profile Updated & Enhanced",
          details: {
            query,
            hotel,
            isApproved: true,
            content: {
              optimizedProfile: opt,
              improvedDescription: opt.description || "",
              improvements: opt.unique_selling_points || [],
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
              status: data.resim_feedback || "Ready for deployment",
              resim_feedback: data.resim_feedback,
              breakdown: data.sub_scores || {},
            },
          },
        };
      }

      if (stageData) {
        onStageComplete(stageData);
      }
    } else if (response.type === "system" && response.status === "complete" && response.final_state) {
      // Store the final state for explicit save via the "Save to Database" button
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pipeline_final_state", JSON.stringify(response.final_state));
      }
      console.log("✅ Pipeline complete. Final state stored for manual save.");
    } else if (response.type === "error") {
      console.error("Pipeline Error:", response.message);
      // Create an error stage to show in the UI
      onStageComplete({
        stage: "original",
        title: "Error",
        preview: "Pipeline Execution Failed",
        details: {
          query,
          hotel,
          content: {
            description: `[Error] ${response.message}`,
            status: "Error",
          }
        }
      });
    }
  };

  ws.onerror = (error) => {
    // React StrictMode might close the connection immediately on mount/unmount.
    // If the socket is closing or closed, ignore the error.
    if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
      return;
    }
    console.error("WebSocket Error: ", error);
    
    // Auto-fallback to mock if connection fails and not explicitly disabled
    if (process.env.NEXT_PUBLIC_AUTO_MOCK !== "false") {
      console.warn("Falling back to mock simulation...");
      simulateMockPipeline(query, hotel, onStageComplete);
    }
  };

  return ws;
};

export const simulateMockPipeline = (
  query: string,
  hotel: string,
  onStageComplete: (stage: StageData) => void
) => {
  const mockData = getMockStageData(query, hotel);
  const stages: Stage[] = ["original", "evaluation", "gap", "optimization", "validation", "result"];

  stages.forEach((stage, index) => {
    setTimeout(() => {
      onStageComplete(mockData[stage]);
    }, (index + 1) * 1500); // 1.5s delay between stages
  });
};

