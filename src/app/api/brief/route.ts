import { buildBriefPrompt, generateGeminiContent } from "@/lib/gemini";
import {
  buildBriefFallback,
  shouldUseGeminiFallback,
} from "@/lib/fallbackResponses";
import type { SerializableMessage } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const briefSystemPrompt =
  "You are a startup analyst. Based on this pitch session, generate a structured one-page investor brief with these exact sections: STARTUP NAME (infer or create one), PROBLEM, SOLUTION, TARGET MARKET, BUSINESS MODEL, KEY RISKS (3 bullets), WHAT TO DO NEXT (3 bullets). Be specific and professional. Return as plain text with section headers.";

export async function POST(request: Request) {
  let body:
    | {
        startupIdea?: string;
        fullConversation?: SerializableMessage[];
      }
    | undefined;

  try {
    body = (await request.json()) as {
      startupIdea?: string;
      fullConversation?: SerializableMessage[];
    };

    if (!body.startupIdea) {
      return Response.json(
        { error: "startupIdea is required." },
        { status: 400 },
      );
    }

    const result = await generateGeminiContent(
      buildBriefPrompt(body.startupIdea, body.fullConversation ?? []),
      {
        systemInstruction: briefSystemPrompt,
        temperature: 0.6,
        maxOutputTokens: 1200,
      },
    );
    const brief = result.response.text().trim();

    return Response.json({ brief });
  } catch (error) {
    console.error("[PitchPK] Brief API error:", error instanceof Error ? error.message : error);
    if (shouldUseGeminiFallback(error)) {
      return Response.json({
        brief: buildBriefFallback(
          body?.startupIdea ?? "",
          body?.fullConversation ?? [],
        ),
      });
    }

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Brief generation failed.",
      },
      { status: 500 },
    );
  }
}
