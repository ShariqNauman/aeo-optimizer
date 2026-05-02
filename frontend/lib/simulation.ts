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

  let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  if (!backendUrl.startsWith("http")) {
    backendUrl = `https://${backendUrl}`;
  }
  // Remove trailing slash if present
  const cleanBackendUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
  const wsUrl = cleanBackendUrl.replace("http", "ws");
  const ws = new WebSocket(`${wsUrl}/ws/optimize`);

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
      } else if (agentName === "seo_analyzer" || agentName === "aeo_analyzer" || agentName === "ai_simulator") {
        let previewText = "Analyzing SEO & Performance...";
        if (agentName === "aeo_analyzer") previewText = "Running AEO Audit...";
        if (agentName === "ai_simulator") previewText = `Score: ${data.evaluation_score || 0} / 100`;

        stageData = {
          stage: "evaluation",
          title: "AI & AEO Evaluation",
          preview: previewText,
          details: {
            query,
            hotel,
            content: {
              score: data.evaluation_score ?? null,
              reasoning: data.evaluation_reasoning || null,
              breakdown: data.sub_scores || {},
              scores: data.seo_scores || null,
              issues: data.seo_issues || [],
              performance_metrics: data.performance_metrics || {},
              aeo_results: data.aeo_results || null,
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
          preview: `Optimization Complete`,
          details: {
            query,
            hotel,
            content: {
              finalScore: data.resim_score,
              delta: data.score_delta,
              status: data.resim_feedback || "Ready for deployment",
              resim_feedback: data.resim_feedback,
              breakdown: data.sub_scores || {},
              optimized_html: data.optimized_html || "",
              seo_suggestions: data.seo_suggestions || [],
              aeo_results: data.aeo_results || {},
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
    if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
      return;
    }
    console.error("WebSocket Error: ", error);
    
    // Create an error stage to show in the UI instead of falling back to mock data
    onStageComplete({
      stage: "original",
      title: "Connection Error",
      preview: "WebSocket Disconnected",
      details: {
        query,
        hotel,
        content: {
          description: "The connection to the optimization server was lost.",
          status: "Error",
        }
      }
    });
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

