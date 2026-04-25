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
WeBoosta's core reasoning and multi-agent orchestration are proudly powered by **Google Gemini 3.1 Pro**. We leverage Gemini's advanced reasoning and massive context window to simulate AI decision-making and generate highly-optimized, machine-readable data.

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

1. 🔍 **Discovery & Intelligence**: Validates natural language queries and discovers candidate hotels using AI-powered search (Tavily) to find official digital footprints.
2. 📥 **Web Research & Extraction**: Crawls the selected hotel's entire website using **Firecrawl** to ingest raw, unstructured data.
3. 🗂️ **Data Aggregation**: Synthesizes fragmented content into a cohesive, structured profile using Gemini's large-context processing.
4. 🤖 **AI Decision Simulator**: Simulates an actual AI travel agent evaluating the property against the user's specific query to calculate an initial "Selection Score".
5. 📊 **Gap Analyzer**: Identifies exactly *why* the AI might skip the property (missing trust signals, weak schema markup, or lack of semantic relevance).
6. ✍️ **Autonomous Optimization**: Automatically generates optimized, schema-ready content and high-impact USPs to address every identified gap.
7. ✅ **QA Validation**: Uses Gemini to verify the optimized profile against the original gaps, ensuring factual accuracy and ensuring no hallucinations were introduced.
8. 📈 **AI Re-simulation**: Re-evaluates the optimized profile using the AI Decision Simulator to mathematically prove the score improvement and ROI.
9. 🧑‍💻 **Human-in-the-Loop (HITL)**: Presents a beautiful, comparative dashboard for human approval before archiving the results to **Supabase**.

---

## 🛠️ Local Setup

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+)
- **Supabase Account** (for database persistence and history)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` folder:
   ```env
   GOOGLE_API_KEY=your_gemini_key
   FIRECRAWL_API_KEY=your_firecrawl_key
   TAVILY_API_KEY=your_tavily_key
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   ```
5. Run the API server:
   ```bash
   python server.py
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file for Supabase client-side access:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 💻 Tech Stack

### 🎨 Frontend
* **Framework:** Next.js (App Router), React
* **Styling:** Tailwind CSS, Framer Motion (for smooth transitions)
* **Visualization:** React Three Fiber & Drei (3D Agentic Simulation visualization)
* **State Management:** React Hooks & WebSocket integration for real-time updates

### ⚙️ Agentic Backend
* **Language:** Python 3.10+
* **Framework:** FastAPI (High-performance asynchronous API)
* **Orchestration:** LangGraph (Stateful, multi-agent orchestration)
* **LLM Integration:** LangChain (Interface for Google Gemini 3.1 Pro and other model providers)
* **Real-time Communication:** WebSockets (Streaming agent updates to frontend)
* **Search & Discovery:**
    - **Tavily AI Search:** For deep hotel discovery and market research.
    - **Firecrawl:** For high-fidelity web scraping and content extraction.
    - **DuckDuckGo Search:** For auxiliary information gathering.
* **Database & Persistence:** Supabase (PostgreSQL) for archiving optimization records and simulation history.
* **Environment:** Pydantic for robust data validation and schema enforcement.

---

*Documentation regarding Quality Assurance & Testing Deployment (QATD) will be available in the repository.*
