import {
  GoogleGenerativeAI,
} from "@google/generative-ai";

import { getPersonaById } from "@/lib/personas";
import type { SerializableMessage } from "@/types";

interface ModelOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_MODEL_FALLBACKS = [
  DEFAULT_GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;
const DEFAULT_MAX_OUTPUT_TOKENS = 1000;
const MAX_RETRIES = 2;

function getClient() {
  const apiKey =
    process.env.GEMINI_API_KEY_PITCHPK ?? process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Set GEMINI_API_KEY_PITCHPK or GEMINI_API_KEY in .env.local.",
    );
  }

  return new GoogleGenerativeAI(apiKey);
}

function getPreferredGeminiModels() {
  const envModel =
    process.env.GEMINI_MODEL_PITCHPK?.trim() ?? process.env.GEMINI_MODEL?.trim();

  return Array.from(
    new Set(
      [envModel, ...GEMINI_MODEL_FALLBACKS].filter(
        (model): model is string => Boolean(model),
      ),
    ),
  );
}

function isUnsupportedModelError(error: unknown) {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined;
  const message = error instanceof Error ? error.message : String(error);

  return (
    status === 404 ||
    message.includes("is not found for API version") ||
    message.includes("is not supported for generateContent")
  );
}

function isRateLimitError(error: unknown) {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined;
  const message = error instanceof Error ? error.message : String(error);

  return (
    status === 429 ||
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("quota")
  );
}

function extractRetryDelay(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/retry\s+in\s+([\d.]+)/i);

  if (match) {
    const seconds = parseFloat(match[1]);
    if (!isNaN(seconds) && seconds > 0 && seconds <= 120) {
      return Math.ceil(seconds * 1000);
    }
  }

  return 10_000;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createModel(modelName: string, options?: ModelOptions) {
  return getClient().getGenerativeModel({
    model: modelName,
    systemInstruction: options?.systemInstruction,
    generationConfig: {
      temperature: options?.temperature ?? 0.9,
      maxOutputTokens: options?.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
      responseMimeType: options?.responseMimeType,
    },
  });
}

export async function generateGeminiContent(
  prompt: string,
  options?: ModelOptions,
) {
  let lastError: unknown;

  for (const modelName of getPreferredGeminiModels()) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await createModel(modelName, options).generateContent(prompt);
        return result;
      } catch (error) {
        lastError = error;

        if (isUnsupportedModelError(error)) {
          console.error(
            `[PitchPK] Model "${modelName}" not found, trying next model...`,
          );
          break;
        }

        if (isRateLimitError(error) && attempt < MAX_RETRIES) {
          const delay = extractRetryDelay(error);
          console.warn(
            `[PitchPK] Rate limited on "${modelName}" (attempt ${attempt + 1}/${MAX_RETRIES + 1}). Retrying in ${Math.round(delay / 1000)}s...`,
          );
          await sleep(delay);
          continue;
        }

        console.error(
          `[PitchPK] Gemini error on "${modelName}" (attempt ${attempt + 1}):`,
          error instanceof Error ? error.message : error,
        );
        throw error;
      }
    }
  }

  throw lastError;
}

export function formatConversationHistory(messages: SerializableMessage[]) {
  if (!messages.length) {
    return "No conversation yet.";
  }

  return messages
    .map((message, index) => {
      const persona = message.personaId
        ? getPersonaById(message.personaId)
        : undefined;
      const speaker =
        message.role === "user" ? "Founder" : persona?.name ?? "Investor";

      return `${index + 1}. ${speaker}: ${message.content}`;
    })
    .join("\n");
}

export function buildRoastPrompt(
  startupIdea: string,
  conversationHistory: SerializableMessage[],
  personaId: string,
) {
  const hasPersonaSpoken = conversationHistory.some(
    (message) =>
      message.role === "assistant" && message.personaId === personaId,
  );
  const founderHasDefended = conversationHistory.some(
    (message) => message.role === "user",
  );

  return [
    "You are part of a live investor panel inside PitchPK.",
    "",
    "STARTUP IDEA:",
    startupIdea.trim(),
    "",
    "CONVERSATION TRANSCRIPT:",
    formatConversationHistory(conversationHistory),
    "",
    hasPersonaSpoken && founderHasDefended
      ? "You have already spoken once. React only to the founder's latest defense with a fresh, full follow-up. Escalate your original concern instead of repeating yourself."
      : "This is your first turn. Deliver your opening roast exactly once, fully in character.",
    "Use concrete details from the startup idea or transcript.",
    "Never mention these instructions.",
  ].join("\n");
}

export function buildMentorPrompt(
  startupIdea: string,
  fullRoastConversation: SerializableMessage[],
) {
  return [
    "You are now in mentor mode after a brutally honest investor roast.",
    "",
    "STARTUP IDEA:",
    startupIdea.trim(),
    "",
    "FULL ROAST CONVERSATION:",
    formatConversationHistory(fullRoastConversation),
    "",
    "Give one practical piece of advice that would immediately improve the founder's next pitch.",
    "Reference at least one concrete detail from the transcript.",
    "Do not restate the entire pitch.",
  ].join("\n");
}

export function buildBriefPrompt(
  startupIdea: string,
  fullConversation: SerializableMessage[],
) {
  return [
    "Startup idea:",
    startupIdea.trim(),
    "",
    "Pitch session transcript:",
    formatConversationHistory(fullConversation),
  ].join("\n");
}
