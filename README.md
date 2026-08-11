# Cinematic Risk Insights

Act as a Principal Frontend Engineer. Build a sleek, modern, institutional-grade financial risk dashboard using React, TypeScript, Tailwind CSS, Lucide icons, and Recharts. The design must be cinematic, dark-mode by default, responsive, and use glassmorphic card styling with clean accent badges.



---



### 1. LAYOUT & SIDE-OVER NAVIGATION

- Do NOT build a long, single-page landing page. 

- Build a fixed Left Side-Over Drawer / Collapsible Navigation Bar with 5 distinct panel views:

  1. 🏠 1. Home Summary

  2. 🤖 2. AI Scenario Copilot

  3. 🔍 3. Asset Risk Analyser

  4. 📜 4. Signal Audit Logs

  5. ⚙️ 5. System Health & API Config



---



### 2. PAGE COMPONENT DESIGNS



#### View 1: 🏠 Home Summary

- **Header:** Dashboard title with real-time status pill.

- **Top Metrics Row:** 3 Stat cards (Overall Market Risk Gauge, Total Monitored Assets, CockroachDB Vector Memory Status).

- **Chart Section:** Recharts interactive line/area chart showing 30-day historical risk trends for key stock tickers.

- **Alert Feed:** List of recent high-severity alerts with severity badges (Low, Medium, High, Critical).



#### View 2: 🤖 AI Scenario Copilot

- **Input Area:** High-end text area for macro/geopolitical query entry with a clear "Run Scenario Analysis" primary action button.

- **Loading State:** Clean pulse/skeleton loading spinner during API requests.

- **Response Container:** Formatted display card rendering structured markdown responses returned from the backend (Probabilities, Impact Analysis, Strategic Actions).



#### View 3: 🔍 Asset Risk Analyser

- **Search Bar:** Ticker input box (e.g., NVDA, TSLA) with an "Analyze Asset" button.

- **Metrics Display:** Stat cards for P/E Ratio, P/S Ratio, Debt-to-Equity, and a visual Risk Score Meter (0-100).

- **Match Comparison Card:** Side-by-side comparison component showing the target ticker metrics vs. matched historical crash profile from CockroachDB vector memory.



#### View 4: 📜 Signal Audit Logs

- **Data Table:** Searchable, filterable UI table rendering historical database records.

- **Columns:** Ticker, Risk Score, Severity Level, P/E Ratio, P/S Ratio, Vector Distance, Timestamp.

- **Toolbar:** "Refresh Logs" button and export options (CSV/JSON).



#### View 5: ⚙️ System Health & API Config

- **Status Badges:** Connection indicators for CockroachDB, Gemini API, Groq LLM, and yfinance.

- **Configuration Form:** Base URL input field (`http://localhost:8000` or production backend URL) with connection test button.



---



### 3. API INTEGRATION & DATA LAYER

- Create a modular API client (`src/services/api.ts`) using Axios/Fetch.

- Wire up clean TypeScript interfaces for backend endpoints:

  - `POST /api/analyze` (Payload: `{ ticker: string }`)

  - `POST /api/scenario` (Payload: `{ query: string }`)

  - `GET /api/signals` (Returns list of CockroachDB historical logs)

  - `GET /api/health` (Returns service status)

- Include clean fallback mock data so all views, charts, and tables render beautifully even before the backend API is connected.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://alpha-insight-18.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ef38b69-6683-42e8-a149-5235d06258fb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
