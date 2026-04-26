import {
  buildMentorPrompt,
  streamGroqContent,
} from "@/lib/groq";
import {
  buildMentorFallback,
  shouldUseLLMFallback,
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
        fullRoastConversation?: SerializableMessage[];
      }
    | undefined;

  try {
    body = (await request.json()) as {
      personaId?: string;
      startupIdea?: string;
      fullRoastConversation?: SerializableMessage[];
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

    const result = await streamGroqContent(
      buildMentorPrompt(
        body.startupIdea,
        body.fullRoastConversation ?? [],
      ),
      {
        systemInstruction: persona.mentorSystemPrompt,
        temperature: 0.7,
        maxOutputTokens: 1200,
      },
    );
    return result;
  } catch (error) {
    console.error("[PitchPK] Mentor API error:", error instanceof Error ? error.message : error);
    if (shouldUseLLMFallback(error)) {
      return streamTextResponse(
        buildMentorFallback(
          body?.personaId ?? "skeptic",
          body?.startupIdea ?? "",
          body?.fullRoastConversation ?? [],
        ),
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Mentor streaming failed.",
      },
      { status: 500 },
    );
  }
}
