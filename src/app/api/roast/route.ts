import {
  buildRoastPrompt,
  generateGeminiContent,
} from "@/lib/gemini";
import {
  buildRoastFallback,
  shouldUseGeminiFallback,
  streamTextResponse,
} from "@/lib/fallbackResponses";
import { getPersonaById } from "@/lib/personas";
import type { SerializableMessage } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body:
    | {
        personaId?: string;
        startupIdea?: string;
        conversationHistory?: SerializableMessage[];
      }
    | undefined;

  try {
    body = (await request.json()) as {
      personaId?: string;
      startupIdea?: string;
      conversationHistory?: SerializableMessage[];
    };

    if (!body.personaId || !body.startupIdea) {
      return Response.json(
        { error: "personaId and startupIdea are required." },
        { status: 400 },
      );
    }

    const persona = getPersonaById(body.personaId);

    if (!persona) {
      return Response.json({ error: "Unknown persona." }, { status: 404 });
    }

    const result = await generateGeminiContent(
      buildRoastPrompt(
        body.startupIdea,
        body.conversationHistory ?? [],
        body.personaId,
      ),
      {
        systemInstruction: persona.roastSystemPrompt,
        temperature: 0.9,
        maxOutputTokens: 1500,
      },
    );
    return streamTextResponse(result.response.text().trim());
  } catch (error) {
    console.error("[PitchPK] Roast API error:", error instanceof Error ? error.message : error);
    if (shouldUseGeminiFallback(error)) {
      return streamTextResponse(
        buildRoastFallback(
          body?.personaId ?? "skeptic",
          body?.startupIdea ?? "",
          body?.conversationHistory ?? [],
        ),
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Roast streaming failed.",
      },
      { status: 500 },
    );
  }
}
