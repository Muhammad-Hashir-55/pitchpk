# 🚀 PitchPK

> **Brutal investor questions first. Useful clarity second.**

PitchPK is an AI-powered platform designed to stress-test your startup ideas before you ever step into a real boardroom. It simulates a panel of ruthless, highly-critical investors to expose the flaws in your business model, while also providing real-time market intelligence and actionable mentorship.

---

## 🛑 The Problem
Startup founders often build in an echo chamber. They spend months (and thousands of dollars) developing a product without properly validating the market, identifying true competitors, or understanding what investors actually care about. When they finally pitch, they get dismantled by questions they should have anticipated on day one.

## 💡 The Solution
PitchPK gives you that brutal reality check instantly. You submit your startup idea, and our AI panel rips it apart, simulating the toughest investor Q&A. 
Beyond the "roast", PitchPK provides:
- **Live Market Intelligence:** Scrapes real web results to find actual competitors and validate market availability.
- **Investor Matching:** Suggests real-world investor archetypes and funding stages that fit your idea.
- **Constructive Mentorship:** After the roast, the panel switches to "mentor mode" to help you fix the holes they just punched in your pitch.
- **Exportable Briefs:** Generates a clean, downloadable scorecard of your startup's viability.

---

## 🛠️ Tech Stack

PitchPK is built with modern, efficient web technologies to ensure a fast, responsive, and reliable experience:

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI Library:** [React 18](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (with custom glassmorphism & dynamic animations)
- **Icons:** React Icons

### Backend & APIs
- **Architecture:** Next.js Serverless API Routes
- **AI / LLM:** Google Gemini API (Using the cutting-edge `Gemini 3.1 Pro` model) via the `@google/generative-ai` SDK.
- **Live Search:** Custom, zero-cost DuckDuckGo HTML scraper for real-time market data grounding.

### Architecture Highlights
- **Single-Call Intelligence API:** We combine Market Search, Investor Matching, and Resource Gathering into a single, highly-optimized `/api/intelligence` call to minimize rate-limiting and maximize speed.
- **Retry & Backoff Logic:** Built-in exponential backoff for AI rate limits ensures the app remains stable even under heavy free-tier API usage.
- **Streaming Responses:** Real-time character-by-character streaming for the roasting and mentoring sessions to simulate an actual conversation.

---

## 🚀 How to Run Locally

Follow these simple steps to get PitchPK running on your local machine.

### 1. Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey) (Free tier works perfectly!)

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/pitchpk.git
cd pitchpk
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a file named `.env.local` in the root directory of the project and add your Gemini API key:

```env
GEMINI_API_KEY_PITCHPK="your_gemini_api_key_here"

# Optional: Override the default model
# GEMINI_MODEL_PITCHPK="gemini-3.1-pro-preview"
```

### 5. Start the Development Server
```bash
npm run dev
```

### 6. Open the App
Navigate to [http://localhost:3000](http://localhost:3000) in your browser. Enter your startup idea and face the panel!

---

## 📂 Project Structure

- `/src/app` - Next.js App Router pages (Landing, Pitch, API Routes)
- `/src/components` - Reusable UI components (`IdeaForm`, `IdeaSuggestions`, `RoastSession`, etc.)
- `/src/lib` - Core utilities (`gemini.ts` for AI, `duckduckgo.ts` for live search, etc.)

---
*Built to make founders sweat now, so they can succeed later.*
