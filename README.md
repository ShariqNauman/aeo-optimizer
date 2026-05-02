# 🚀 WeBoosta
### *Visible to Agents, Not Just Humans.*

---

## 🎥 1. Pitching Video
> **Important:** Please watch our pitching video to see WeBoosta in action!

[![Watch the Pitching Video](https://img.shields.io/badge/▶_Watch_Pitching_Video-Red?style=for-the-badge)](https://drive.google.com/file/d/1Ngip81kyP2aR-nUTL_b-SdVoAenoVH43/view?usp=sharing)

*(Link to Google Drive)*

---

## 🏆 UMHackathon 2026
**Domain 1:** AI Systems & Agentic Workflow Automation

We are proud to present **WeBoosta**, developed for UMHackathon 2026. 

### 🤝 Powered by Google Gemini
WeBoosta's core reasoning and multi-agent orchestration are proudly powered by **Google Gemini 3.1**. We leverage Gemini's advanced reasoning and massive context window to simulate AI decision-making and generate highly-optimized, machine-readable data.

---

## 👥 Team UMami

| Name                    | Role                                           | University          |
| :---------------------- | :--------------------------------------------- | :------------------ |
| **Leong Wui Yip**       | Pitching Video (Director, Recording & Editing) | Monash University   |
| **Francis Paul Narcis** | Documentation (PRD & System Analysis)          | Monash University   |
| **Muhammad Ahmad**      | QA & Pitch Deck                                | Monash University   |
| **Shariq Nauman**       | Backend Developer                              | Monash University   |
| **Lee Ping Xian**       | UI/UX Designer & Workflow System Architect     | Taylor's University |

---

## 💡 The Vision: Marketing to AI
The digital landscape is experiencing a paradigm shift. Travelers are no longer just using search engines; they are relying on AI travel agents to plan itineraries, select hotels, and make booking decisions. 

**The future of marketing is "Marketing to AI".** 

If an AI agent cannot easily read, understand, and extract structured value from your digital profile, your business becomes invisible in this new era. WeBoosta bridges this "visibility gap" through AI-Search Engine Optimization (AEO).

---

## 🛑 The Problem: Fragmented & Manual Workflows
Currently, optimizing a hotel or business for digital discovery is a painfully manual, human-centric process:
1. Marketing teams guess what keywords might work.
2. Data is scattered across unstructured websites and disparate OTA platforms.
3. Updates require constant manual human intervention.
4. **Crucially:** The resulting content is designed for human eyes, not machine-readable schemas, meaning AI agents often bypass highly qualified businesses simply because the data is too hard to parse.

## 🎯 Our Solution: The Agentic Workflow
**WeBoosta transforms this fragmented, manual struggle into an intelligent, automated, and auditable multi-agent workflow.**

Instead of guessing what an AI wants, WeBoosta **simulates** the AI. We evaluate a property's likelihood of being selected by an AI agent and automatically generate optimized, machine-readable content to guarantee higher selection rates.

### ⚙️ How the WeBoosta Pipeline Works:
Our system utilizes a stateful **LangGraph** multi-agent pipeline orchestrated by **Gemini 3.1** across sequential stages:

1. 🔍 **Discovery & Intelligence**: Validates natural language queries and discovers candidate hotels using AI-powered search (Google Gemini Search) to find official digital footprints.
2. 📥 **Web Research & Extraction**: Crawls the selected hotel's entire website using **Firecrawl** to ingest raw, unstructured data.
3. 🗂️ **Data Aggregation**: Synthesizes fragmented content into a cohesive, structured profile using Gemini's large-context processing.
4. 📊 **SEO & AEO Audit**: Runs Google PageSpeed Lighthouse audits, image alt-text analysis, semantic word-choice density scoring, and `llms.txt` detection.
5. 🤖 **AI Decision Simulator**: Simulates an actual AI travel agent evaluating the property against the user's specific query to calculate an initial "Selection Score".
6. 📊 **Gap Analyzer**: Identifies exactly *why* the AI might skip the property (missing trust signals, weak schema markup, or lack of semantic relevance).
7. ✍️ **Autonomous Optimization**: Automatically restructures and enhances existing hotel data to maximize semantic specificity — strictly without fabricating new information.
8. ✅ **QA Validation**: Uses Gemini to detect hallucinations by comparing the optimized profile against the original data source. Supports up to 2 automatic retries with feedback-driven self-correction.
9. 📈 **AI Re-simulation**: Re-evaluates the optimized profile using the AI Decision Simulator to mathematically prove the score improvement and ROI.
10. 🧑‍💻 **Human-in-the-Loop (HITL)**: Presents a comparative dashboard for human approval before archiving the results to **Supabase**.

---

## 📂 Project Structure

```
aeo-optimizer/
├── backend/                    # FastAPI + LangGraph Pipeline
│   ├── server.py               # FastAPI entry point (REST + WebSocket)
│   ├── main.py                 # CLI entry point (standalone pipeline)
│   ├── Procfile                # Railway deployment start command
│   ├── requirements.txt        # Python dependencies
│   ├── src/
│   │   ├── graph.py            # LangGraph pipeline definition (10 nodes)
│   │   ├── state.py            # AEOState TypedDict (shared pipeline state)
│   │   ├── llm.py              # LLM factory (Gemini provider)
│   │   ├── supabase_client.py  # Supabase persistence layer
│   │   └── agents/
│   │       ├── discovery_agent.py   # Hotel search & query validation
│   │       ├── web_researcher.py    # Firecrawl web scraping
│   │       ├── data_aggregation.py  # Structured profile extraction
│   │       ├── seo_analyzer.py      # Google PageSpeed Lighthouse
│   │       ├── aeo_analyzer.py      # AEO audit (alt text, semantics, llms.txt)
│   │       ├── ai_simulator.py      # AI decision simulation (scoring)
│   │       ├── gap_analyzer.py      # Weakness identification
│   │       ├── optimizer.py         # Content restructuring (anti-hallucination)
│   │       ├── validator.py         # Hallucination detection & QA
│   │       └── resimulator.py       # Final scoring & SEO suggestions
│   └── tests/
│       ├── test_aeo_analyzer.py     # Unit tests: AEO analysis functions
│       ├── test_agents.py           # Unit tests: optimizer, validator, resimulator
│       └── test_integration.py      # Integration tests: API endpoints & WebSocket
│
├── frontend/                   # Next.js 15 + React Three Fiber
│   ├── app/                    # Next.js App Router pages
│   ├── components/
│   │   ├── cube/               # 3D pipeline visualization
│   │   ├── panel/              # Result, AEO, SEO, Optimization panels
│   │   ├── charts/             # Recharts data visualizations
│   │   └── ui/                 # Discovery chat, navigation, shared UI
│   ├── lib/
│   │   ├── store.ts            # Zustand state management
│   │   ├── simulation.ts       # WebSocket pipeline client
│   │   └── mockData.ts         # Offline mock data for testing
│   ├── __tests__/
│   │   └── store.test.ts       # Unit tests: Zustand store
│   ├── jest.config.mjs         # Jest configuration
│   └── package.json            # Node.js dependencies & scripts
│
├── docs/                       # Hackathon submission documents
└── README.md                   # This file
```

---

## 🛠️ Local Setup

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+)
- **Supabase Account** (for database persistence)

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:
```env
GOOGLE_API_KEY=your_gemini_key
PAGESPEED_API_KEY=your_pagespeed_key
FIRECRAWL_API_KEY=your_firecrawl_key
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

Run the server:
```bash
python server.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
```

Create a `.env.local` file in the `frontend/` folder:
```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_AUTO_MOCK=false
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run the development server:
```bash
npm run dev
```

### 4. Running Tests
```bash
# Backend (from backend/ directory)
python -m pytest tests -v

# Frontend (from frontend/ directory)
npm run test
```

---

## 💻 Tech Stack

### 🎨 Frontend
* **Framework:** Next.js 15 (App Router), React 19
* **Styling:** Tailwind CSS 4, Framer Motion
* **3D Visualization:** React Three Fiber & Drei
* **State Management:** Zustand (with persist middleware)
* **Charts:** Recharts

### ⚙️ Agentic Backend
* **Language:** Python 3.11
* **Framework:** FastAPI (async ASGI server with Uvicorn)
* **Orchestration:** LangGraph (stateful multi-agent graph with conditional edges)
* **LLM:** Google Gemini 3.1 Flash Lite (via LangChain)
* **Web Scraping:** Firecrawl API
* **SEO Audit:** Google PageSpeed Insights API
* **Real-Time Streaming:** WebSocket (FastAPI native)
* **Database:** Supabase (PostgreSQL with RLS)

### ☁️ Deployment
* **Frontend:** Vercel (Edge CDN with auto-deploy)
* **Backend:** Railway (containerized with Procfile)
* **Database:** Supabase (managed PostgreSQL)
* **CI/CD:** GitHub Actions (pytest + Jest, auto-deploy on main)

---

© 2026 Team UMami — UMHackathon 2026
