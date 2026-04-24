import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Stage, StageData } from "@/types/stage";
import { RecordEntry, mockRecords } from "./mockRecords";

interface SessionState {
  query: string;
  hotelUrl: string;
  stages: Partial<Record<Stage, StageData>>;
  records: RecordEntry[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setSession: (query: string, hotelUrl: string) => void;
  setStages: (stages: Partial<Record<Stage, StageData>>) => void;
  addStage: (stage: StageData) => void;
  addRecord: (record: Omit<RecordEntry, "id">) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      query: "",
      hotelUrl: "",
      stages: {},
      records: [], // Always start empty, fetched from Supabase on demand
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setSession: (query, hotelUrl) => set((state) => {
        if (state.query === query && state.hotelUrl === hotelUrl) return state;
        return { query, hotelUrl, stages: {} };
      }),
      setStages: (stages) => set({ stages }),
      addStage: (stageData) => set((state) => ({ 
        stages: { ...state.stages, [stageData.stage]: stageData } 
      })),
      addRecord: (record) => {
        // Records are now saved to Supabase via the backend
        console.log("Record archived to cloud:", record);
      },
      clearSession: () => set({ query: "", hotelUrl: "", stages: {} }),
    }),
    {
      name: "aeo-session-storage",
      partialize: (state) => ({ 
        query: state.query, 
        hotelUrl: state.hotelUrl,
        stages: state.stages
      }), // Exclude records from local storage persistence
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
