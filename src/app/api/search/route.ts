import { getGeminiModel } from "@/lib/gemini";
import type { NextRequest } from "next/server";

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
}

export async function POST(request: NextRequest) {
  try {
    const { startupIdea } = (await request.json()) as { startupIdea: string };

    if (!startupIdea || startupIdea.trim().length < 10) {
      return Response.json(
        { error: "Idea must be at least 10 characters" },
        { status: 400 }
      );
    }

    const model = getGeminiModel({
      temperature: 0.7,
      maxOutputTokens: 400,
    });

    const prompt = `Given this startup idea: "${startupIdea}"

Generate exactly 3 search queries, 3 relevant topics, and 3 current trends related to this idea.
Also estimate whether this startup idea is already available in the market and list up to 3 existing products/companies that are close.

Format as JSON (only JSON, no markdown):
{
  "queries": ["query1", "query2", "query3"],
  "topics": ["topic1", "topic2", "topic3"],
  "trends": ["trend1", "trend2", "trend3"],
  "availability": {
    "status": "likely-existing | partially-served | whitespace-opportunity",
    "confidence": 0,
    "summary": "1-2 line explanation",
    "existingProducts": [
      {"name": "Company/Product", "note": "How close it is"},
      {"name": "Company/Product", "note": "How close it is"}
    ]
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const rawData = JSON.parse(jsonMatch[0]) as Partial<SearchResult>;

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
    };

    return Response.json(searchData);
  } catch (error) {
    console.error("Search API error:", error);
    return Response.json(
      { error: "Failed to generate search suggestions" },
      { status: 500 }
    );
  }
}
