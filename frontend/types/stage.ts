export type Stage =
  | "original"
  | "evaluation"
  | "gap"
  | "optimization"
  | "validation"
  | "result";

export interface StageData {
  stage: Stage;
  title: string;
  preview: string;
  details: {
    query: string;
    hotel: string;
    content: any;
    isApproved?: boolean;
  };
}
