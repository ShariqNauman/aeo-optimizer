# Integration & API Testing (System Modules)

This test is mainly conducting communication (e.g., Frontend to Backend, Backend to Database) to ensure they integrate correctly.

**Test Tool Used:** Postman automated collections, Pytest/HTTPX (Backend testing), Cypress (E2E Frontend integration)
**Targeted Integrations:** Frontend fetching data from Backend API, Backend REST & WebSocket endpoints, Backend connecting to Supabase database, Backend integrating with LLM graph services.
**File(s) Covered:** `backend/server.py`, `backend/src/supabase_client.py`, `backend/src/agents/discovery_agent.py`

| Test ID | Integration / Point Tested | Test Scenario | Expected Outcome | Actual Result | Status |
|---|---|---|---|---|---|
| IT-01 | `POST /api/validate_url` -> Frontend / Backend | Send a valid hotel URL from frontend to backend for validation. | Should return HTTP 200. Response should contain `is_valid: true` and a valid reason. | Returned HTTP 200 with `is_valid` properly evaluated. | PASS |
| IT-02 | `POST /api/validate_url` -> Frontend / Backend | Send a hallucinated or non-hotel URL. | Should return HTTP 200. Response should contain `is_valid: false` and an explanation. | Returned HTTP 200 with `is_valid` flag successfully evaluated. | PASS |
| IT-03 | `POST /api/search_hotels` -> Backend / LLM | Send a natural language query ("Hotels in Bali"). Tests backend connection to discovery LLM agent. | Should return HTTP 200. Response must contain a populated `hotels` array of names and URLs. | Returned HTTP 200 with valid array. (Note: Raised `InsecureRequestWarning` for some hotel domains). | PASS |
| IT-04 | `WS /ws/optimize` -> Frontend / Backend | Establish a WebSocket connection and send initial `hotel_url` payload. | Connection established. Should stream `agent_update` messages sequentially, ending with `system` complete. | Connected successfully. Streaming messages received (e.g., `agent_update`). | PASS |
| IT-05 | `WS /ws/optimize` -> Backend / LLM Pipeline | Trigger optimization pipeline with valid payload. Validates LangGraph nodes communication with LLM provider. | Pipeline runs to completion without crashing. Final state contains `optimized_score`, `seo_issues`, and `optimized_html`. | LangGraph nodes successfully structured data and executed without crashing. | PASS |
| IT-06 | `POST /api/save_record` -> Backend / Supabase | Send final optimization result state to persist in database. | Should return HTTP 200 with `success: true` and an `id`. Record should exist in the Supabase table. | Success. Returned HTTP 200 with ID: `299760c3-d2d5...`. Record archived successfully. | PASS |
| IT-07 | `POST /api/save_record` -> Backend / Supabase | Send save request with invalid Supabase environment configuration or connection timeout. | Should return HTTP 200 with `success: false` and a clear error message. Backend should not crash. | [Not Executed] | Pending |
