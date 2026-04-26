import { generateGroqContent } from "@/lib/groq";
import { searchDuckDuckGo } from "@/lib/duckduckgo";
import { shouldUseLLMFallback } from "@/lib/fallbackResponses";
import { extractJsonFromResponse } from "@/lib/jsonExtract";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IntelligenceResult {
  search: {
    queries: string[];
    topics: string[];
    trends: string[];
    availability: {
      status: "likely-existing" | "partially-served" | "whitespace-opportunity";
      confidence: number;
      summary: string;
      existingProducts: Array<{ name: string; note: string }>;
    };
    webResults?: Array<{ title: string; url: string; snippet: string }>;
  };
  investors: {
    investors: Array<{ name: string; focus: string; stage: string; linkedin: string }>;
    investmentStage: string;
  };
  websites: {
    websites: Array<{ name: string; category: string; purpose: string }>;
    resources: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { startupIdea } = (await request.json()) as { startupIdea: string };

    if (!startupIdea || startupIdea.trim().length < 10) {
      return Response.json(
        { error: "Idea must be at least 10 characters" },
        { status: 400 },
      );
    }

    // 1. DuckDuckGo search to ground the response (Free, fast)
    const searchQuery = startupIdea.trim().split(/\s+/).slice(0, 8).join(" ") + " startup";
    const webResults = await searchDuckDuckGo(searchQuery, 6);
    
    const webContext = webResults.length > 0
      ? `\n\nREAL WEB SEARCH RESULTS (use these to ground your analysis):\n${webResults
          .map((r, i) => `${i + 1}. "${r.title}" — ${r.snippet} (${r.url})`)
          .join("\n")}`
      : "";

    // 2. Single combined Gemini Prompt
    const prompt = `Startup idea: "${startupIdea}"
${webContext}

Perform a comprehensive analysis of this startup idea including market availability, recommended investors, and helpful resources.
Use the provided web search results to inform your list of existing products if applicable.

Return a JSON object strictly following this structure:
{
  "search": {
    "queries": ["query1", "query2", "query3"],
    "topics": ["topic1", "topic2", "topic3"],
    "trends": ["trend1", "trend2", "trend3"],
    "availability": {
      "status": "likely-existing" | "partially-served" | "whitespace-opportunity",
      "confidence": 0-100,
      "summary": "1-2 line explanation",
      "existingProducts": [
        {"name": "Company", "note": "Match level"}
      ]
    }
  },
  "investors": {
    "investors": [
      {"name": "Investor Type/Name", "focus": "Focus area", "stage": "Round type", "linkedin": "linkedin url"}
    ],
    "investmentStage": "Seed/Series A/etc"
  },
  "websites": {
    "websites": [
       {"name": "Website Name", "category": "Category", "purpose": "Why it's useful"}
    ],
    "resources": ["Resource 1", "Resource 2", "Resource 3"]
  }
}

Important Rules:
- "investors.investors" must have exactly 4 items.
- "websites.websites" must have exactly 5 items.
- Provide highly specific, actionable content instead of generic advice.`;

    const result = await generateGroqContent(prompt, {
      temperature: 0.2, // Low temperature for more structured, factual outputs
      maxOutputTokens: 2500, // Enough for the large structured JSON
      responseFormat: { type: "json_object" },
    });

    const text = result.text();
    let rawData: Partial<IntelligenceResult>;

    try {
      rawData = JSON.parse(extractJsonFromResponse(text)) as Partial<IntelligenceResult>;
    } catch (e) {
      console.error("[PitchPK] Intelligence JSON Parse Error. Raw text was:", text);
      throw e;
    }

    // Prepare complete data with safe defaults for missing fields
    const intelligenceData: IntelligenceResult = {
      search: {
        queries: Array.isArray(rawData.search?.queries) ? rawData.search.queries.slice(0, 3) : [],
        topics: Array.isArray(rawData.search?.topics) ? rawData.search.topics.slice(0, 3) : [],
        trends: Array.isArray(rawData.search?.trends) ? rawData.search.trends.slice(0, 3) : [],
        availability: {
          status: rawData.search?.availability?.status || "partially-served",
          confidence: typeof rawData.search?.availability?.confidence === 'number' ? rawData.search.availability.confidence : 50,
          summary: rawData.search?.availability?.summary || "Market coverage appears mixed.",
          existingProducts: Array.isArray(rawData.search?.availability?.existingProducts) ? rawData.search.availability.existingProducts : []
        },
        webResults: webResults.slice(0, 4)
      },
      investors: {
        investors: Array.isArray(rawData.investors?.investors) ? rawData.investors.investors.slice(0, 4) : [],
        investmentStage: rawData.investors?.investmentStage || "Pre-Seed"
      },
      websites: {
        websites: Array.isArray(rawData.websites?.websites) ? rawData.websites.websites.slice(0, 5) : [],
        resources: Array.isArray(rawData.websites?.resources) ? rawData.websites.resources.slice(0, 3) : []
      }
    };

    return Response.json(intelligenceData);

  } catch (error) {
    console.error("[PitchPK] Intelligence API error:", error instanceof Error ? error.message : error);

    // Provide a comprehensive fallback using DuckDuckGo directly
    if (shouldUseLLMFallback(error)) {
        try {
            const { startupIdea } = await request.clone().json() as { startupIdea: string };
            const searchQuery = startupIdea.trim().split(/\s+/).slice(0, 8).join(" ") + " startup";
            const webResults = await searchDuckDuckGo(searchQuery, 4);

            return Response.json({
                search: {
                    queries: ["startup validation", "market sizing", "competitor analysis"],
                    topics: ["Problem-solution fit", "Early traction", "Go to market"],
                    trends: ["AI application", "Workflow improvement"],
                    availability: { status: "partially-served", confidence: 50, summary: "API fallback: Live data not available.", existingProducts: [] },
                    webResults
                },
                investors: { investors: [], investmentStage: "Seed" },
                websites: { websites: [], resources: [] }
            });
        } catch {
             return Response.json({ error: "Failed to generate intelligence data" }, { status: 500 });
        }
    }

    return Response.json({ error: "Failed to generate intelligence data" }, { status: 500 });
  }
}
