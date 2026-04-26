import { generateGeminiContent } from "@/lib/gemini";
import { shouldUseGeminiFallback } from "@/lib/fallbackResponses";
import { extractJsonFromResponse } from "@/lib/jsonExtract";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function buildFallbackInvestors(startupIdea: string): InvestorResult {
  const idea = startupIdea.toLowerCase();
  const isPakistanFocused =
    idea.includes("pakistan") || idea.includes("pk") || idea.includes("karachi") || idea.includes("lahore");
  const isAgri = idea.includes("farm") || idea.includes("agri") || idea.includes("crop");
  const isHealth = idea.includes("health") || idea.includes("clinic") || idea.includes("doctor");
  const isSaas = idea.includes("saas") || idea.includes("platform") || idea.includes("software");

  const investors: Investor[] = [];

  if (isPakistanFocused) {
    investors.push({
      name: "Lakson Venture Capital",
      focus: "Pakistan-focused early-stage startups",
      stage: "Seed to Series A",
      linkedin: "https://www.linkedin.com/company/lakson-venture-capital/",
    });
    investors.push({
      name: "Indus Valley Capital",
      focus: "Pakistan & South Asia tech startups",
      stage: "Pre-Seed to Seed",
      linkedin: "https://www.linkedin.com/company/indus-valley-capital/",
    });
  }

  if (isAgri) {
    investors.push({
      name: "AgriTech VC / Omnivore Partners",
      focus: "Agriculture technology and rural innovation",
      stage: "Seed to Series A",
      linkedin: "https://www.linkedin.com/company/omnivore/",
    });
  }

  if (isHealth) {
    investors.push({
      name: "HealthTech focused angel networks",
      focus: "Digital health, telemedicine, and clinic management",
      stage: "Angel to Seed",
      linkedin: "https://www.linkedin.com/search/results/companies/?keywords=healthtech%20venture%20capital",
    });
  }

  if (isSaas) {
    investors.push({
      name: "SaaS-focused micro-VCs",
      focus: "B2B SaaS, vertical software, workflow automation",
      stage: "Pre-Seed to Seed",
      linkedin: "https://www.linkedin.com/search/results/companies/?keywords=saas%20venture%20capital",
    });
  }

  // Fill to 4
  const defaults: Investor[] = [
    {
      name: "Y Combinator",
      focus: "Early-stage startups across all sectors",
      stage: "Pre-Seed",
      linkedin: "https://www.linkedin.com/school/y-combinator/",
    },
    {
      name: "Techstars",
      focus: "Accelerator program for early-stage startups",
      stage: "Pre-Seed to Seed",
      linkedin: "https://www.linkedin.com/company/techstars/",
    },
    {
      name: "500 Global",
      focus: "Global early-stage investments",
      stage: "Seed",
      linkedin: "https://www.linkedin.com/company/500startups/",
    },
    {
      name: "Angel investors via AngelList",
      focus: "Broad early-stage investing platform",
      stage: "Angel to Seed",
      linkedin: "https://www.linkedin.com/company/angellist/",
    },
  ];

  while (investors.length < 4 && defaults.length > 0) {
    const next = defaults.shift()!;
    if (!investors.some((inv) => inv.name === next.name)) {
      investors.push(next);
    }
  }

  return {
    investors: investors.slice(0, 4),
    investmentStage: "Seed",
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

    const result = await generateGeminiContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1000,
      responseMimeType: "application/json",
    });
    const text = result.response.text();
    
    const rawData = JSON.parse(extractJsonFromResponse(text)) as Partial<InvestorResult>;

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
    console.error("[PitchPK] Investors API error:", error instanceof Error ? error.message : error);

    if (shouldUseGeminiFallback(error)) {
      try {
        const { startupIdea } = await request.clone().json() as { startupIdea: string };
        return Response.json(buildFallbackInvestors(startupIdea));
      } catch {
        return Response.json(buildFallbackInvestors("startup idea"));
      }
    }

    return Response.json(
      { error: "Failed to generate investor recommendations" },
      { status: 500 },
    );
  }
}
