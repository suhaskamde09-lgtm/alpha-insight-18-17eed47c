
# 📈 AlphaInsight - AI-Powered Financial Risk Intelligence

An institutional-grade risk assessment engine that combines real-time market data, AI-driven sentiment analysis, and dynamic mathematical stress-testing.

## 🚀 Architecture
This project uses a decoupled, full-stack architecture:
- **Frontend (This Repo):** Built with React, Vite, Tailwind CSS, and Recharts for visual gauges and interactive probability models.
- **Backend Repository:** https://github.com/cockroachlabs/cockroachdb-skills.git
  - Powered by **FastAPI**, **`yfinance`**, **CockroachDB**, and **Gemini / Groq AI**.

  ---

  ## ✨ Key Features
  - **Dynamic Risk Gauge:** Visual score (0-100) and AI confidence metrics.
  - **Stress-Test Probability Curves:** Interactive Recharts rendering calculated risk projections over time.
  - **Live News & Sentiment Scoring:** Real-time news ingestion tagged with AI impact metrics.
  - **"Why This Score?" Risk Engine:** Transparent weighted breakdown of risk drivers.

  ---

  ## 🛠️ Local Setup Instructions

  ### 1. Backend Setup
  1. Clone the [Backend Repo](https://github.com/your-username/your-backend-repo).
  2. Install dependencies: `pip install -r requirements.txt`
  "pip install fastapi uvicorn groq python-dotenv"
  "pip install google-genai google-generativeai yfinance fastaipi uvicorn groq python-dotenv psycopg2-binary"
  "uvicorn main:app --reload --port 8000"
  "make .env file and put your api key as exact format
  GROQ_API_KEY="your_api_key"
  GEMINI_API_KEY="your_api_key"
  DATABASE_URL=postgresql://usename:password@cluster-name.cockroach.cloud:26257/defaultdb?sslmode=verify-full"

  3. Run FastAPI: `uvicorn main:app --reload --port 8000`

  ### 2. Frontend Setup
  1. Clone this repo: `git clone <your-frontend-url>`
  2. Install dependencies: `npm install`
  3. Configure API endpoint in `src/services/api.ts` put your port 8000 url 8n line 73 
  4. Run dev server: `npm run dev`