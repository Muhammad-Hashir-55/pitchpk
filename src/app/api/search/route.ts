import { generateGeminiContent } from "@/lib/gemini";
import { searchDuckDuckGo } from "@/lib/duckduckgo";
import { shouldUseGeminiFallback } from "@/lib/fallbackResponses";
import { extractJsonFromResponse } from "@/lib/jsonExtract";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SearchResult {
  queries: string[];
  topics: string[];
  trends: string[];
  availability: {
    status: "likely-existing" | "partially-served" | "whitespace-opportunity";
    confidence: number;
    summary: string;
    existingProducts: Array<{
      name: string;
      note: string;
    }>;
  };
  webResults?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

function buildFallbackSearch(startupIdea: string): SearchResult {
  const idea = startupIdea.toLowerCase();
  const queries = [
    `${startupIdea.split(" ").slice(0, 5).join(" ")} startup`,
    `${idea.includes("pakistan") ? "Pakistan" : "South Asia"} startup market ${new Date().getFullYear()}`,
    `competitors ${startupIdea.split(" ").slice(0, 4).join(" ")}`,
  ];
  return {
    queries,
    topics: [
      "Startup validation and problem-solution fit",
      "Market sizing for emerging markets",
      "Competitor landscape analysis",
    ],
    trends: [
      "AI-powered vertical SaaS for developing markets",
      "Mobile-first product design for underserved segments",
      "Data-driven decision making for traditional industries",
    ],
    availability: {
      status: "partially-served",
      confidence: 50,
      summary: "Market coverage appears mixed. Real-time search was unavailable — review the web results below for current data.",
      existingProducts: [],
    },
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

    // Run real web search via DuckDuckGo (free, no API key)
    const searchQuery = startupIdea.trim().split(/\s+/).slice(0, 8).join(" ") + " startup";
    const webResults = await searchDuckDuckGo(searchQuery, 6);

    // Build a prompt that includes real search data so Gemini can ground its response
    const webContext = webResults.length > 0
      ? `\n\nREAL WEB SEARCH RESULTS (use these to ground your analysis):\n${webResults
          .map((r, i) => `${i + 1}. "${r.title}" — ${r.snippet} (${r.url})`)
          .join("\n")}`
      : "";

    const prompt = `Startup idea: "${startupIdea}"
${webContext}

Analyze this idea and return a JSON object with:
- "queries": 3 research queries
- "topics": 3 relevant topics
- "trends": 3 current trends
- "availability": { "status": "likely-existing"|"partially-served"|"whitespace-opportunity", "confidence": 0-100, "summary": "1-2 line explanation", "existingProducts": [{"name": "Company", "note": "Match level"}] }
Use the provided web search results to find real companies.`;

    const result = await generateGeminiContent(prompt, {
      temperature: 0.2,
      maxOutputTokens: 2000, // Increased
      responseMimeType: "application/json",
    });
    
    const candidate = result.response.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const text = result.response.text();
    

    let rawData: Partial<SearchResult>;
    try {
      rawData = JSON.parse(extractJsonFromResponse(text)) as Partial<SearchResult>;
    } catch (e) {
      console.error("[PitchPK] JSON Parse Error. Raw text was:", text);
      throw e;
    }

    const searchData: SearchResult = {
      queries: Array.isArray(rawData.queries) ? rawData.queries.slice(0, 3) : [],
      topics: Array.isArray(rawData.topics) ? rawData.topics.slice(0, 3) : [],
      trends: Array.isArray(rawData.trends) ? rawData.trends.slice(0, 3) : [],
      availability: {
        status:
          rawData.availability?.status === "likely-existing" ||
          rawData.availability?.status === "partially-served" ||
          rawData.availability?.status === "whitespace-opportunity"
            ? rawData.availability.status
            : "partially-served",
        confidence:
          typeof rawData.availability?.confidence === "number"
            ? Math.max(0, Math.min(100, rawData.availability.confidence))
            : 50,
        summary:
          rawData.availability?.summary?.trim() ||
          "Market coverage appears mixed based on current patterns.",
        existingProducts: Array.isArray(rawData.availability?.existingProducts)
          ? rawData.availability.existingProducts.slice(0, 3).map((item) => ({
              name: item?.name?.trim() || "Unknown",
              note: item?.note?.trim() || "No details provided.",
            }))
          : [],
      },
      webResults: webResults.slice(0, 4).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
      })),
    };

    return Response.json(searchData);
  } catch (error) {
    console.error("[PitchPK] Search API error:", error instanceof Error ? error.message : error);

    // Try to at least return real web search results even if Gemini fails
    try {
      const { startupIdea } = await request.clone().json() as { startupIdea: string };
      const searchQuery = startupIdea.trim().split(/\s+/).slice(0, 8).join(" ") + " startup";
      const webResults = await searchDuckDuckGo(searchQuery, 6);
      const fallback = buildFallbackSearch(startupIdea);
      fallback.webResults = webResults.slice(0, 4).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
      }));
      return Response.json(fallback);
    } catch {
      // Total failure
    }

    if (shouldUseGeminiFallback(error)) {
      return Response.json(buildFallbackSearch("startup idea"));
    }

    return Response.json(
      { error: "Failed to generate search suggestions" },
      { status: 500 },
    );
  }
}
