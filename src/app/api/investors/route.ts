import { getGeminiModel } from "@/lib/gemini";
import type { NextRequest } from "next/server";

interface Investor {
  name: string;
  focus: string;
  stage: string;
  linkedin: string;
}

interface InvestorResult {
  investors: Investor[];
  investmentStage: string;
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

Analyze this idea and recommend investor types/categories and investment stages.

Generate 4 relevant investor profiles with their names (can be generic like "Venture Capital" types), focus areas, investment stages, and a LinkedIn URL if known.
If exact profile is unknown, provide a best-effort LinkedIn company/search link.

Also determine what investment stage this idea is most suitable for (Seed, Series A, Series B, etc).

Format as JSON (only JSON, no markdown):
{
  "investors": [
    {"name": "Investor Type", "focus": "Focus area", "stage": "Round type", "linkedin": "https://www.linkedin.com/..."},
    {"name": "Investor Type", "focus": "Focus area", "stage": "Round type", "linkedin": "https://www.linkedin.com/..."},
    {"name": "Investor Type", "focus": "Focus area", "stage": "Round type", "linkedin": "https://www.linkedin.com/..."},
    {"name": "Investor Type", "focus": "Focus area", "stage": "Round type", "linkedin": "https://www.linkedin.com/..."}
  ],
  "investmentStage": "Seed/Series A/etc"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const rawData = JSON.parse(jsonMatch[0]) as Partial<InvestorResult>;

    const investorData: InvestorResult = {
      investmentStage: rawData.investmentStage?.trim() || "Seed",
      investors: Array.isArray(rawData.investors)
        ? rawData.investors.slice(0, 4).map((investor) => ({
            name: investor?.name?.trim() || "Investor profile",
            focus: investor?.focus?.trim() || "General startup investing",
            stage: investor?.stage?.trim() || "Seed",
            linkedin:
              investor?.linkedin?.trim() ||
              "https://www.linkedin.com/search/results/companies/",
          }))
        : [],
    };

    return Response.json(investorData);
  } catch (error) {
    console.error("Investors API error:", error);
    return Response.json(
      { error: "Failed to generate investor recommendations" },
      { status: 500 }
    );
  }
}
