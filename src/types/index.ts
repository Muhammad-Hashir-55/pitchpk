export type PersonaStatus = "waiting" | "thinking" | "speaking" | "done";
export type AppMode =
  | "idle"
  | "roasting"
  | "defending"
  | "flipping"
  | "mentor"
  | "brief";

export interface Persona {
  id: string;
  name: string;
  title: string;
  emoji: string;
  accentColor: string;
  glowColor: string;
  catchphrase: string;
  roastSystemPrompt: string;
  mentorSystemPrompt: string;
}

export interface Message {
  role: "user" | "assistant";
  personaId?: string;
  content: string;
  timestamp: Date;
}

export interface ScoreDimension {
  id:
    | "problem"
    | "market"
    | "business"
    | "execution"
    | "defensibility"
    | "traction"
    | "defense";
  label: string;
  score: number;
  weight: number;
  summary: string;
}

export interface PersonaPressure {
  personaId: string;
  name: string;
  severity: number;
  defended: boolean;
  issue: string;
  themes: string[];
}

export interface PitchScorecard {
  overall: number;
  survivalRate: number;
  roastTemperature: number;
  evidenceScore: number;
  questionsDodged: number;
  defendedQuestions: number;
  readinessLabel: string;
  verdict: string;
  strongestSignal: string;
  biggestRisk: string;
  dimensions: ScoreDimension[];
  personaBreakdown: PersonaPressure[];
}

export interface SessionState {
  mode: AppMode;
  startupIdea: string;
  conversationHistory: Message[];
  personaMessages: Record<string, string>;
  personaStatuses: Record<string, PersonaStatus>;
  briefContent: string;
}

export type SerializableMessage = Omit<Message, "timestamp"> & {
  timestamp: string | Date;
};
