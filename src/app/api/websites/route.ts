import { getGeminiModel } from "@/lib/gemini";
import type { NextRequest } from "next/server";

interface Website {
  name: string;
  category: string;
  purpose: string;
}

interface WebsiteResult {
  websites: Website[];
  resources: string[];
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
      maxOutputTokens: 500,
    });

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

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const websiteData: WebsiteResult = JSON.parse(jsonMatch[0]);

    return Response.json(websiteData);
  } catch (error) {
    console.error("Websites API error:", error);
    return Response.json(
      { error: "Failed to generate website recommendations" },
      { status: 500 }
    );
  }
}
