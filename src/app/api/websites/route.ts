import { generateGeminiContent } from "@/lib/gemini";
import { shouldUseGeminiFallback } from "@/lib/fallbackResponses";
import { extractJsonFromResponse } from "@/lib/jsonExtract";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Website {
  name: string;
  category: string;
  purpose: string;
}

interface WebsiteResult {
  websites: Website[];
  resources: string[];
}

const FALLBACK_WEBSITES: WebsiteResult = {
  websites: [
    {
      name: "Crunchbase",
      category: "Market Research",
      purpose: "Research competitors, funding rounds, and market landscape for your startup space",
    },
    {
      name: "Google Trends",
      category: "Trend Analysis",
      purpose: "Validate demand and search interest for your problem space over time",
    },
    {
      name: "Product Hunt",
      category: "Launch & Discovery",
      purpose: "Discover similar products, validate uniqueness, and plan your launch strategy",
    },
    {
      name: "Statista",
      category: "Market Data",
      purpose: "Find market size data, industry statistics, and growth projections for your pitch deck",
    },
    {
      name: "AngelList / Wellfound",
      category: "Fundraising",
      purpose: "Connect with angel investors and find startup job candidates",
    },
  ],
  resources: [
    "Y Combinator Startup School (free online course on building startups)",
    "Paul Graham's Essays on Startups (paulgraham.com)",
    "Lean Canvas template for rapid business model validation",
  ],
};

export async function POST(request: NextRequest) {
  try {
    const { startupIdea } = (await request.json()) as { startupIdea: string };

    if (!startupIdea || startupIdea.trim().length < 10) {
      return Response.json(
        { error: "Idea must be at least 10 characters" },
        { status: 400 },
      );
    }

    const prompt = `Given this startup idea: "${startupIdea}"

Recommend 5 useful websites, platforms, or tools that would be helpful for this startup. These could be for market research, competitor analysis, user acquisition, funding, etc.

Also list 3 useful resources or guides they should explore.

Format as JSON (only JSON, no markdown):
{
  "websites": [
    {"name": "Website Name", "category": "Category", "purpose": "Why it's useful"},
    {"name": "Website Name", "category": "Category", "purpose": "Why it's useful"},
    {"name": "Website Name", "category": "Category", "purpose": "Why it's useful"},
    {"name": "Website Name", "category": "Category", "purpose": "Why it's useful"},
    {"name": "Website Name", "category": "Category", "purpose": "Why it's useful"}
  ],
  "resources": ["Resource/Guide 1", "Resource/Guide 2", "Resource/Guide 3"]
}`;

    const result = await generateGeminiContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
    });
    const text = result.response.text();
    
    const rawData = JSON.parse(extractJsonFromResponse(text)) as Partial<WebsiteResult>;

    const websiteData: WebsiteResult = {
      websites: Array.isArray(rawData.websites)
        ? rawData.websites.slice(0, 5).map((w) => ({
            name: w?.name?.trim() || "Unknown",
            category: w?.category?.trim() || "General",
            purpose: w?.purpose?.trim() || "Useful for startup research",
          }))
        : FALLBACK_WEBSITES.websites,
      resources: Array.isArray(rawData.resources)
        ? rawData.resources.slice(0, 3)
        : FALLBACK_WEBSITES.resources,
    };

    return Response.json(websiteData);
  } catch (error) {
    console.error("[PitchPK] Websites API error:", error instanceof Error ? error.message : error);

    if (shouldUseGeminiFallback(error)) {
      return Response.json(FALLBACK_WEBSITES);
    }

    return Response.json(
      { error: "Failed to generate website recommendations" },
      { status: 500 },
    );
  }
}
