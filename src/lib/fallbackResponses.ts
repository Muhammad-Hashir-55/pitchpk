import { getPersonaById } from "@/lib/personas";
import type { SerializableMessage } from "@/types";

function trimIdeaSnippet(startupIdea: string) {
  const compact = startupIdea.replace(/\s+/g, " ").trim();

  if (compact.length <= 140) {
    return compact;
  }

  return `${compact.slice(0, 137).trimEnd()}...`;
}

function latestFounderMessage(messages: SerializableMessage[]) {
  return [...messages]
    .reverse()
    .find((message) => message.role === "user")
    ?.content.trim();
}

function inferStartupName(startupIdea: string) {
  const tokens = startupIdea
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return tokens.length ? tokens.join(" ") : "PitchPK Startup";
}

function inferTargetMarket(startupIdea: string) {
  const idea = startupIdea.toLowerCase();

  if (idea.includes("farmer") || idea.includes("agri")) {
    return "Pakistani farmers, agri-middlemen, and logistics providers in crop-heavy districts.";
  }

  if (idea.includes("clinic") || idea.includes("health")) {
    return "Small and mid-sized clinics that need faster coordination, booking, or diagnostics workflows.";
  }

  if (idea.includes("saas") || idea.includes("platform")) {
    return "SMBs in Pakistan that currently manage the workflow through spreadsheets, WhatsApp, and manual follow-up.";
  }

  return "A narrowly defined early-adopter segment in Pakistan with a painful workflow and clear willingness to pay.";
}

export function shouldUseLLMFallback(error: unknown) {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined;
  const message = error instanceof Error ? error.message : String(error);

  const isFallback =
    message.includes("Groq") ||
    message.includes("groq") ||
    message.includes("fetch failed") ||
    status === 404 ||
    status === 429 ||
    status === 500 ||
    status === 503;

  if (isFallback) {
    console.error(
      `[PitchPK] LLM failed (status=${status ?? "N/A"}), using fallback. Reason: ${message.slice(0, 200)}`,
    );
  }

  return isFallback;
}

export function streamTextResponse(text: string) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-PitchPK-Fallback": "true",
    },
  });
}

export function buildRoastFallback(
  personaId: string,
  startupIdea: string,
  conversationHistory: SerializableMessage[],
) {
  const persona = getPersonaById(personaId);
  const ideaSnippet = trimIdeaSnippet(startupIdea);
  const latestDefense = latestFounderMessage(conversationHistory);
  const isFollowup = Boolean(
    latestDefense &&
      conversationHistory.some(
        (message) =>
          message.role === "assistant" && message.personaId === personaId,
      ),
  );

  if (!persona) {
    return "Interesting. The panel is unconvinced because the idea still lacks a clear edge.";
  }

  if (persona.id === "skeptic") {
    return isFollowup
      ? `Dekho, your defense sounds confident, but confidence is not validation. If "${latestDefense}" is the best proof you have, what objective evidence would make a stranger believe this pain is urgent enough to change behavior?`
      : `Bhai, "${ideaSnippet}" sounds energetic, but where is the proof that this problem is painful enough for people to switch habits? Right now it feels like a neat concept searching for a real wound.`;
  }

  if (persona.id === "market") {
    return isFollowup
      ? `Your response helps on narrative, not economics. Show the first paying customer path, expected revenue per account, and why the math works before CAC eats the whole story.`
      : `The concept is clear, but the business math is still hiding. Who pays first, what is the expected revenue per customer, and how large is the reachable market before this turns into a nice feature instead of a venture-scale company?`;
  }

  return isFollowup
    ? `Good energy, but the moat is still thin. If a fast local team or Big Tech clone copied the obvious features next quarter, what part of your product or data loop would still belong to you?`
    : `Nice pitch, but I still do not know what the first build actually is. What is the smallest MVP for "${ideaSnippet}" that can ship fast, prove demand, and avoid becoming a bloated product nobody finishes?`;
}

export function buildMentorFallback(
  personaId: string,
  startupIdea: string,
  fullConversation: SerializableMessage[],
) {
  const ideaSnippet = trimIdeaSnippet(startupIdea);
  const latestFounderReply = latestFounderMessage(fullConversation);

  if (personaId === "skeptic") {
    return `Interview 10 target users and rewrite the pitch around one painful workflow you can verify, not three theoretical ones. If the founder's best defense was "${latestFounderReply ?? "still forming"}", turn that into a specific proof point with quotes, frequency, and urgency.`;
  }

  if (personaId === "market") {
    return `Add a simple wedge model: define one buyer, one price point, and one realistic first-year customer count. For "${ideaSnippet}", even a clean bottom-up estimate from 100 reachable accounts is stronger than a giant TAM with no revenue logic.`;
  }

  return `Cut the MVP to one job and one measurable output, then ship that before adding platform ambition. For this idea, win with speed, workflow depth, or proprietary data collection early so the product becomes harder to clone later.`;
}

export function buildBriefFallback(
  startupIdea: string,
  fullConversation: SerializableMessage[],
) {
  const startupName = inferStartupName(startupIdea);
  const ideaSnippet = trimIdeaSnippet(startupIdea);
  const market = inferTargetMarket(startupIdea);
  const latestFounderReply = latestFounderMessage(fullConversation);

  return [
    `STARTUP NAME: ${startupName}`,
    `PROBLEM: The founder is addressing a workflow pain around "${ideaSnippet}", but the urgency, switching trigger, and proof of demand still need sharper validation.`,
    `SOLUTION: Build a focused first product that solves one painful task clearly and measurably, instead of pitching a broad platform on day one.`,
    `TARGET MARKET: ${market}`,
    "BUSINESS MODEL: Start with one primary monetization path such as SaaS subscription, transaction fee, or B2B annual contract, then justify pricing with a clear ROI story.",
    `KEY RISKS:\n- Problem urgency is not yet backed by enough user evidence.\n- Revenue assumptions are still thinner than the narrative.\n- Technical defensibility needs more than surface-level features.${latestFounderReply ? `\n- The founder's latest defense, "${latestFounderReply}", should be converted into measurable proof.` : ""}`,
    "WHAT TO DO NEXT:\n- Interview target customers and quantify the pain frequency.\n- Define the smallest MVP and a 90-day launch scope.\n- Add pricing, market sizing, and proof points to the next investor deck.",
  ].join("\n\n");
}
