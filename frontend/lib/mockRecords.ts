export interface RecordEntry {
  id: number;
  date: string;
  query: string;
  url: string;
  baseline: number;
  optimized: number;
  delta: string;
  reasoning: string;
  original_profile?: any;
  optimized_profile?: any;
}

export const mockRecords: RecordEntry[] = [
  {
    id: 1,
    date: "2026-04-20",
    query: "Best luxury hotel in KL with a view of Petronas",
    url: "https://www.mandarinoriental.com/kl",
    baseline: 42,
    optimized: 68,
    delta: "+26",
    reasoning: "Missing machine-readable pricing schemas and location relevance markers."
  },
  {
    id: 2,
    date: "2026-04-21",
    query: "Family resort near city center with pool",
    url: "https://www.fourseasons.com/kl",
    baseline: 38,
    optimized: 71,
    delta: "+33",
    reasoning: "Amenity tags were inconsistent with agentic extraction patterns."
  },
  {
    id: 3,
    date: "2026-04-22",
    query: "Corporate stay with high-speed fiber",
    url: "https://www.eqkualalumpur.com/",
    baseline: 55,
    optimized: 74,
    delta: "+19",
    reasoning: "Optimized technical specifications for better LLM context retrieval."
  }
];
