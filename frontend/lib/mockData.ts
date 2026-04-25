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
          name: hotel || "Mandarin Oriental, Kuala Lumpur",
          location: "Kuala Lumpur City Centre, 50088 Kuala Lumpur, Malaysia",
          star_rating: 5.0,
          description: "A luxury hotel located between the flowering gardens of the Kuala Lumpur City Centre Park and the dramatic heights of the Petronas Twin Towers.",
          amenities: ["Outdoor Pool", "Spa", "Fitness Center", "Free WiFi", "Tennis Courts"],
          room_types: ["Deluxe Park View Room", "Club Room", "Executive Suite", "Presidential Suite"],
          dining_options: ["Lai Po Heen", "Mosaic", "Mandarin Grill", "Lounge on the Park"],
          price_range: "$250 - $600",
          review_summary: "Exceptional service and unbeatable location near the Twin Towers. Guests highly praise the pool and breakfast.",
          unique_selling_points: ["Prime location next to Petronas Towers", "Award-winning spa", "Infinity pool with park views"],
          nearby_attractions: ["Petronas Twin Towers", "Suria KLCC", "KLCC Park", "Aquaria KLCC"],
          contact_info: "Phone: +60 3-2380 8888 | Email: mokul-reservations@mohg.com",
          structured_data_available: false,
        },
      },
    },
    evaluation: {
      stage: "evaluation",
      title: "AI Evaluation",
      preview: "Score: 48 / 100",
      details: {
        query,
        hotel,
        content: {
          score: 48,
          reasoning: "While the hotel is a premium property, its current digital profile fails to explicitly address the specific 'AEO' requirements for the query. The machine-readable data is sparse, and key semantic markers for family-oriented luxury are missing despite the hotel having these features.",
          breakdown: {
            relevance: 12,
            completeness: 10,
            trust_signals: 15,
            value_proposition: 8,
            structured_data_quality: 3,
          },
        },
      },
    },
    gap: {
      stage: "gap",
      title: "Gap Analysis",
      preview: "4 Critical Gaps Found",
      details: {
        query,
        hotel,
        content: {
          gaps: [
            {
              category: "structured_data_quality",
              description: "Missing JSON-LD Schema.org markup for hotel amenities and pricing.",
              severity: "high",
              suggested_improvement: "Implement full Schema.org/Hotel markup with specific @type for LuxuryHotel.",
              estimated_point_gain: 15
            },
            {
              category: "relevance",
              description: "Description does not emphasize family-friendly high-end services requested in query.",
              severity: "medium",
              suggested_improvement: "Rewrite description to highlight 'Little Fans' program and family suites.",
              estimated_point_gain: 10
            },
            {
              category: "completeness",
              description: "Dining options lack specific mention of 'Kid-friendly menus'.",
              severity: "low",
              suggested_improvement: "Add specific meal-type tags for all on-site restaurants.",
              estimated_point_gain: 5
            },
            {
              category: "value_proposition",
              description: "Unique Selling Points are generic and don't leverage the 'view' as a primary retrieval hook.",
              severity: "medium",
              suggested_improvement: "Define 'Petronas View' as a primary semantic attribute.",
              estimated_point_gain: 12
            }
          ],
        },
      },
    },
    optimization: {
      stage: "optimization",
      title: "Content Optimization",
      preview: "Profile Enhanced +26",
      details: {
        query,
        hotel,
        isApproved: false,
        content: {
          optimizedProfile: {
            name: hotel || "Mandarin Oriental, Kuala Lumpur",
            location: "Kuala Lumpur City Centre, 50088 Kuala Lumpur, Malaysia",
            star_rating: 5.0,
            description: "Experience the pinnacle of family luxury at Mandarin Oriental, KL. Perfectly situated between KLCC Park and the Petronas Twin Towers, our optimized suites offer dedicated 'Little Fans' programs for younger guests alongside world-class business facilities.",
            amenities: ["Infinity Pool with Kids Area", "The Spa (Award Winning)", "Little Fans Kids Club", "Tennis Courts", "Elite Fitness Center"],
            room_types: ["Family Discovery Suite", "Petronas View Executive", "Club Deluxe", "Royal Suite"],
            dining_options: ["Lai Po Heen (Kids Menu Available)", "Mosaic Family Dining", "Mandarin Grill", "AQUA Restaurant & Bar"],
            price_range: "$250 - $600",
            review_summary: "Voted #1 for Family Luxury in KL. Superior agentic signals for retrieval.",
            unique_selling_points: ["Guaranteed Petronas Twin Tower views", "Comprehensive family-friendly 'Little Fans' concierge", "Direct machine-readable access to real-time inventory"],
            nearby_attractions: ["Petronas Twin Towers (50m)", "Suria KLCC (Direct Access)", "KLCC Park (Adjacent)"],
            contact_info: "Phone: +60 3-2380 8888 | Email: mokul-reservations@mohg.com",
            structured_data_available: true,
          },
        },
      },
    },
    validation: {
      stage: "validation",
      title: "AI Validation",
      preview: "Passed (100% Quality)",
      details: {
        query,
        hotel,
        content: {
          confidence: 0.99,
          status: "Optimized profile successfully addresses all 4 gaps. No hallucinations detected. Tone remains consistent with Mandarin Oriental brand standards.",
        },
      },
    },
    result: {
      stage: "result",
      title: "Final Result",
      preview: "Ready for Retrieval",
      details: {
        query,
        hotel,
        content: {
          finalScore: 74,
          delta: 26,
          status: "Optimization Complete",
          resim_score: 74,
          resim_feedback: "The optimized profile now ranks in the top 5% for 'Luxury Family' queries in Kuala Lumpur. The addition of structured data markup ensures 100% fidelity for AI agents.",
          breakdown: {
            relevance: 18,
            completeness: 15,
            trust_signals: 18,
            value_proposition: 15,
            structured_data_quality: 8,
          },
        },
      },
    },
  };
};

