import { useSessionStore } from '../lib/store';

describe('SessionStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useSessionStore.setState({
      query: "",
      hotelUrl: "",
      stages: {},
      records: [],
      _hasHydrated: false,
    });
  });

  // UT-13
  it('setSession updates the query and hotelUrl and clears stages', () => {
    const store = useSessionStore.getState();
    store.setSession("Test Query", "https://example.com");

    const updatedStore = useSessionStore.getState();
    expect(updatedStore.query).toBe("Test Query");
    expect(updatedStore.hotelUrl).toBe("https://example.com");
    expect(Object.keys(updatedStore.stages).length).toBe(0);
  });

  // UT-14
  it('addStage merges new stage data correctly into the stages record', () => {
    const store = useSessionStore.getState();
    
    // Dispatch update
    store.addStage({
      stage: "optimization",
      title: "Running Optimizer",
      preview: "Optimization in progress",
      details: {
        query: "test",
        hotel: "test",
        content: { foo: "bar" }
      }
    });

    const updatedStore = useSessionStore.getState();
    expect(updatedStore.stages["optimization"]?.title).toBe("Running Optimizer");
    expect(updatedStore.stages["optimization"]?.preview).toBe("Optimization in progress");
  });
});
