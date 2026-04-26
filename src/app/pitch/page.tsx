"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import confetti from "canvas-confetti";

import { BriefExport } from "@/components/BriefExport";
import { IdeaForm } from "@/components/IdeaForm";
import { MentorSession } from "@/components/MentorSession";
import { ModeFlip } from "@/components/ModeFlip";
import { RoastSession } from "@/components/RoastSession";
import { PERSONAS } from "@/lib/personas";
import { generateInvestorBrief } from "@/lib/pdfGenerator";
import { calculatePitchScorecard } from "@/lib/scoring";
import type {
  Message,
  PersonaStatus,
  SerializableMessage,
  SessionState,
} from "@/types";

const PLACEHOLDERS = [
  "An app that helps Pakistani farmers forecast crop prices before harvest...",
  "A marketplace for freelance finance teams serving export businesses...",
  "AI-powered tool that turns WhatsApp support chaos into clean CRM workflows...",
  "A SaaS platform connecting small clinics with diagnostic labs in real time...",
];

const FALLBACK_PERSONA_MESSAGE =
  "Even our investors crashed. That's how devastating your idea was.";

function createEmptyMessages() {
  return PERSONAS.reduce<Record<string, string>>((acc, persona) => {
    acc[persona.id] = "";
    return acc;
  }, {});
}

function createEmptyStatuses() {
  return PERSONAS.reduce<Record<string, PersonaStatus>>((acc, persona) => {
    acc[persona.id] = "waiting";
    return acc;
  }, {});
}

function createInitialSession(): SessionState {
  return {
    mode: "idle",
    startupIdea: "",
    conversationHistory: [],
    personaMessages: createEmptyMessages(),
    personaStatuses: createEmptyStatuses(),
    briefContent: "",
  };
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function serializeMessages(messages: Message[]): SerializableMessage[] {
  return messages.map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  }));
}

function buildFallbackBrief(startupIdea: string) {
  const summary = startupIdea.trim() || "Untitled startup idea";

  return [
    "STARTUP NAME: PitchPK Rescue Brief",
    `PROBLEM: Founders struggle to explain the specific pain point behind this idea clearly enough for investors to trust it. Current summary: ${summary}`,
    `SOLUTION: Turn the concept into a simpler first-step offer with one user segment, one job-to-be-done, and one measurable promise. Idea summary: ${summary}`,
    "TARGET MARKET: Start with a narrow, reachable customer group in Pakistan before claiming a broad regional market.",
    "BUSINESS MODEL: Pick one primary monetization path first, such as subscription, transaction fee, or B2B annual contract.",
    "KEY RISKS:\n- Problem urgency is not yet quantified.\n- Revenue logic needs clearer assumptions.\n- Technical moat may be easy to copy.",
    "WHAT TO DO NEXT:\n- Interview 10 target users and capture repeating pain points.\n- Define an MVP that delivers one obvious outcome.\n- Add pricing, market size, and traction proof to the next pitch.",
  ].join("\n\n");
}

export default function PitchPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>(createInitialSession);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showIdeaWarning, setShowIdeaWarning] = useState(false);
  const [isIdeaShaking, setIsIdeaShaking] = useState(false);
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  const [revealedPersonaIds, setRevealedPersonaIds] = useState<string[]>([]);
  const [activeCatchphrasePersonaId, setActiveCatchphrasePersonaId] = useState<
    string | null
  >(null);
  const [introEmojiCount, setIntroEmojiCount] = useState(0);
  const [showAssemblyOverlay, setShowAssemblyOverlay] = useState(false);
  const [showLaunchText, setShowLaunchText] = useState(false);
  const [defenseInput, setDefenseInput] = useState("");
  const [isSubmittingDefense, setIsSubmittingDefense] = useState(false);
  const [isModeFlipActive, setIsModeFlipActive] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [isDownloadingBrief, setIsDownloadingBrief] = useState(false);
  const [roastIntensity, setRoastIntensity] = useState(0);
  const [mentorIntensity, setMentorIntensity] = useState(0);

  const conversationHistoryRef = useRef<Message[]>([]);
  const personaMessagesRef = useRef<Record<string, string>>(createEmptyMessages());
  const personaStatusesRef = useRef<Record<string, PersonaStatus>>(
    createEmptyStatuses(),
  );
  const startupIdeaRef = useRef("");
  const sessionTokenRef = useRef(0);
  const abortControllersRef = useRef<AbortController[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const wordCount = useMemo(
    () => countWords(session.startupIdea),
    [session.startupIdea],
  );
  const scorecard = useMemo(
    () => calculatePitchScorecard(session.startupIdea, session.conversationHistory),
    [session.startupIdea, session.conversationHistory],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % PLACEHOLDERS.length);
    }, 2800);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const syncSession = (updater: (previous: SessionState) => SessionState) => {
    setSession((previous) => {
      const next = updater(previous);

      conversationHistoryRef.current = next.conversationHistory;
      personaMessagesRef.current = next.personaMessages;
      personaStatusesRef.current = next.personaStatuses;
      startupIdeaRef.current = next.startupIdea;

      return next;
    });
  };

  const setStartupIdea = (value: string) => {
    if (showIdeaWarning && countWords(value) >= 30) {
      setShowIdeaWarning(false);
    }

    syncSession((previous) => ({
      ...previous,
      startupIdea: value,
    }));
  };

  const setConversationHistory = (messages: Message[]) => {
    syncSession((previous) => ({
      ...previous,
      conversationHistory: messages,
    }));
  };

  const setPersonaMessage = (personaId: string, message: string) => {
    syncSession((previous) => ({
      ...previous,
      personaMessages: {
        ...previous.personaMessages,
        [personaId]: message,
      },
    }));
  };

  const appendPersonaMessage = (personaId: string, chunk: string) => {
    syncSession((previous) => ({
      ...previous,
      personaMessages: {
        ...previous.personaMessages,
        [personaId]: `${previous.personaMessages[personaId]}${chunk}`,
      },
    }));
  };

  const setPersonaStatus = (personaId: string, status: PersonaStatus) => {
    syncSession((previous) => ({
      ...previous,
      personaStatuses: {
        ...previous.personaStatuses,
        [personaId]: status,
      },
    }));
  };

  const resetDisplayedPersonas = () => {
    syncSession((previous) => ({
      ...previous,
      personaMessages: createEmptyMessages(),
      personaStatuses: createEmptyStatuses(),
    }));
    setRevealedPersonaIds([]);
    setActiveCatchphrasePersonaId(null);
  };

  const cancelActiveRequests = () => {
    sessionTokenRef.current += 1;
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current = [];
  };

  const hardReset = () => {
    cancelActiveRequests();
    const next = createInitialSession();
    conversationHistoryRef.current = next.conversationHistory;
    personaMessagesRef.current = next.personaMessages;
    personaStatusesRef.current = next.personaStatuses;
    startupIdeaRef.current = next.startupIdea;
    setSession(next);
    setShowIdeaWarning(false);
    setIsIdeaShaking(false);
    setIsSubmittingIdea(false);
    setRevealedPersonaIds([]);
    setActiveCatchphrasePersonaId(null);
    setIntroEmojiCount(0);
    setShowAssemblyOverlay(false);
    setShowLaunchText(false);
    setDefenseInput("");
    setIsSubmittingDefense(false);
    setIsModeFlipActive(false);
    setIsGeneratingBrief(false);
    setIsDownloadingBrief(false);
    setRoastIntensity(0);
    setMentorIntensity(0);
  };

  const ensureAudioContext = async () => {
    if (typeof window === "undefined") {
      return null;
    }

    const windowWithWebkit = window as Window &
      typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
      };
    const AudioCtor =
      window.AudioContext ?? windowWithWebkit.webkitAudioContext;

    if (!AudioCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playDing = async () => {
    const context = await ensureAudioContext();

    if (!context) {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(760, now);
    oscillator.frequency.exponentialRampToValueAtTime(1120, now + 0.14);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  };

  const playWhoosh = async () => {
    const context = await ensureAudioContext();

    if (!context) {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(320, now);
    oscillator.frequency.exponentialRampToValueAtTime(70, now + 0.42);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.48);
  };

  const launchConfetti = () => {
    const duration = 2500;
    const end = Date.now() + duration;
    const colors = ["#c54b2d", "#fff4e8", "#0f5b5a"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.72 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.72 },
        colors,
      });

      if (Date.now() < end) {
        window.requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const showValidationWarning = () => {
    setShowIdeaWarning(true);
    setIsIdeaShaking(true);
    window.setTimeout(() => setIsIdeaShaking(false), 550);
  };

  const isStaleToken = (token: number) => sessionTokenRef.current !== token;

  const revealPersona = async (personaId: string, token: number) => {
    if (isStaleToken(token)) {
      return false;
    }

    setRevealedPersonaIds((current) =>
      current.includes(personaId) ? current : [...current, personaId],
    );
    setActiveCatchphrasePersonaId(personaId);
    await wait(1500);

    if (isStaleToken(token)) {
      return false;
    }

    setActiveCatchphrasePersonaId((current) =>
      current === personaId ? null : current,
    );

    return true;
  };

  const streamPersonaResponse = async ({
    endpoint,
    body,
    personaId,
    token,
    prepend = "",
    resetMessage = false,
  }: {
    endpoint: "/api/roast" | "/api/mentor";
    body: Record<string, unknown>;
    personaId: string;
    token: number;
    prepend?: string;
    resetMessage?: boolean;
  }) => {
    if (resetMessage) {
      setPersonaMessage(personaId, "");
    }

    if (prepend) {
      appendPersonaMessage(personaId, prepend);
    }

    const controller = new AbortController();
    abortControllersRef.current = [...abortControllersRef.current, controller];

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Streaming request failed with ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let streamedText = "";
    let queue = "";
    let networkDone = false;

    try {
      const result = await new Promise<string>(async (resolve, reject) => {
        const typewriter = window.setInterval(() => {
          if (isStaleToken(token)) {
            window.clearInterval(typewriter);
            reject(new Error("Session changed."));
            return;
          }

          if (queue.length > 0) {
            const nextCharacter = queue[0];
            queue = queue.slice(1);
            streamedText += nextCharacter;
            setPersonaStatus(personaId, "speaking");
            appendPersonaMessage(personaId, nextCharacter);
          } else if (networkDone) {
            window.clearInterval(typewriter);
            resolve(streamedText.trim());
          }
        }, 16);

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              queue += decoder.decode();
              networkDone = true;
              break;
            }

            queue += decoder.decode(value, { stream: true });
          }
        } catch (error) {
          window.clearInterval(typewriter);
          reject(error);
        }
      });

      return result;
    } finally {
      abortControllersRef.current = abortControllersRef.current.filter(
        (activeController) => activeController !== controller,
      );
    }
  };

  const runAssemblyIntro = async (token: number) => {
    setShowAssemblyOverlay(true);
    setShowLaunchText(false);
    setIntroEmojiCount(0);

    for (let index = 1; index <= PERSONAS.length; index += 1) {
      if (isStaleToken(token)) {
        return;
      }

      setIntroEmojiCount(index);
      await wait(420);
    }

    if (isStaleToken(token)) {
      return;
    }

    setShowLaunchText(true);
    await wait(650);

    if (isStaleToken(token)) {
      return;
    }

    setShowAssemblyOverlay(false);
    setShowLaunchText(false);
    setIntroEmojiCount(0);
  };

  const appendConversationMessage = (message: Message) => {
    const nextHistory = [...conversationHistoryRef.current, message];
    setConversationHistory(nextHistory);
  };

  const runRoastRound = async (
    token: number,
    round: "initial" | "followup",
  ) => {
    const idea = startupIdeaRef.current.trim();

    if (round === "followup") {
      setRoastIntensity(0);
    }

    for (let index = 0; index < PERSONAS.length; index += 1) {
      const persona = PERSONAS[index];

      if (isStaleToken(token)) {
        return;
      }

      if (round === "initial") {
        const revealed = await revealPersona(persona.id, token);

        if (!revealed) {
          return;
        }
      }

      setPersonaStatus(persona.id, "thinking");

      const existingMessage = personaMessagesRef.current[persona.id];
      const prepend = round === "followup" && existingMessage ? "\n\n" : "";

      try {
        const streamedText = await streamPersonaResponse({
          endpoint: "/api/roast",
          body: {
            personaId: persona.id,
            startupIdea: idea,
            conversationHistory: serializeMessages(conversationHistoryRef.current),
          },
          personaId: persona.id,
          token,
          prepend,
          resetMessage: round === "initial",
        });

        appendConversationMessage({
          role: "assistant",
          personaId: persona.id,
          content: streamedText || FALLBACK_PERSONA_MESSAGE,
          timestamp: new Date(),
        });
      } catch {
        if (isStaleToken(token)) {
          return;
        }

        if (round === "initial") {
          setPersonaMessage(persona.id, FALLBACK_PERSONA_MESSAGE);
        } else {
          appendPersonaMessage(persona.id, FALLBACK_PERSONA_MESSAGE);
        }

        appendConversationMessage({
          role: "assistant",
          personaId: persona.id,
          content: FALLBACK_PERSONA_MESSAGE,
          timestamp: new Date(),
        });
      }

      if (isStaleToken(token)) {
        return;
      }

      setPersonaStatus(persona.id, "done");
      setRoastIntensity(((index + 1) / PERSONAS.length) * 100);
      await playDing();
    }

    if (isStaleToken(token)) {
      return;
    }

    if (round === "initial") {
      syncSession((previous) => ({
        ...previous,
        mode: "defending",
      }));
      setIsSubmittingIdea(false);
      return;
    }

    setIsSubmittingDefense(false);
    syncSession((previous) => ({
      ...previous,
      mode: "flipping",
    }));
    setIsModeFlipActive(true);
    await playWhoosh();
    await wait(2500);

    if (isStaleToken(token)) {
      return;
    }

    setIsModeFlipActive(false);
    resetDisplayedPersonas();
    setMentorIntensity(0);
    syncSession((previous) => ({
      ...previous,
      mode: "mentor",
    }));
    await runMentorRound(token);
  };

  const runMentorRound = async (token: number) => {
    const idea = startupIdeaRef.current.trim();

    for (let index = 0; index < PERSONAS.length; index += 1) {
      const persona = PERSONAS[index];
      const revealed = await revealPersona(persona.id, token);

      if (!revealed) {
        return;
      }

      setPersonaStatus(persona.id, "thinking");

      try {
        const streamedText = await streamPersonaResponse({
          endpoint: "/api/mentor",
          body: {
            personaId: persona.id,
            startupIdea: idea,
            fullRoastConversation: serializeMessages(
              conversationHistoryRef.current,
            ),
          },
          personaId: persona.id,
          token,
          resetMessage: true,
        });

        appendConversationMessage({
          role: "assistant",
          personaId: persona.id,
          content: streamedText || FALLBACK_PERSONA_MESSAGE,
          timestamp: new Date(),
        });
      } catch {
        if (isStaleToken(token)) {
          return;
        }

        setPersonaMessage(persona.id, FALLBACK_PERSONA_MESSAGE);
        appendConversationMessage({
          role: "assistant",
          personaId: persona.id,
          content: FALLBACK_PERSONA_MESSAGE,
          timestamp: new Date(),
        });
      }

      if (isStaleToken(token)) {
        return;
      }

      setPersonaStatus(persona.id, "done");
      setMentorIntensity(((index + 1) / PERSONAS.length) * 100);
      await playDing();
    }

    if (isStaleToken(token)) {
      return;
    }

    syncSession((previous) => ({
      ...previous,
      mode: "brief",
    }));
  };

  const handleIdeaSubmit = async () => {
    if (wordCount < 30) {
      showValidationWarning();
      return;
    }

    cancelActiveRequests();
    const token = sessionTokenRef.current;
    const idea = session.startupIdea.trim();

    setShowIdeaWarning(false);
    setIsSubmittingIdea(true);
    setDefenseInput("");
    setRoastIntensity(0);
    setMentorIntensity(0);
    setRevealedPersonaIds([]);
    setActiveCatchphrasePersonaId(null);
    setIsModeFlipActive(false);
    syncSession(() => ({
      ...createInitialSession(),
      startupIdea: idea,
      mode: "roasting",
    }));

    try {
      await runAssemblyIntro(token);

      if (isStaleToken(token)) {
        return;
      }

      await runRoastRound(token, "initial");
    } catch {
      if (isStaleToken(token)) {
        return;
      }

      setIsSubmittingIdea(false);
      syncSession((previous) => ({
        ...previous,
        mode: "idle",
      }));
    }
  };

  const handleDefenseSubmit = async () => {
    const trimmed = defenseInput.trim();

    if (!trimmed) {
      return;
    }

    const token = sessionTokenRef.current;
    setIsSubmittingDefense(true);
    setDefenseInput("");

    appendConversationMessage({
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    });

    await runRoastRound(token, "followup");
  };

  const handleGenerateBrief = async () => {
    if (isGeneratingBrief) {
      return;
    }

    setIsGeneratingBrief(true);

    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupIdea: startupIdeaRef.current,
          fullConversation: serializeMessages(conversationHistoryRef.current),
        }),
      });

      if (!response.ok) {
        throw new Error(`Brief request failed with ${response.status}`);
      }

      const data = (await response.json()) as { brief?: string };

      syncSession((previous) => ({
        ...previous,
        briefContent: data.brief?.trim() || buildFallbackBrief(previous.startupIdea),
      }));
    } catch {
      syncSession((previous) => ({
        ...previous,
        briefContent: buildFallbackBrief(previous.startupIdea),
      }));
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleDownloadBrief = async () => {
    if (!session.briefContent) {
      return;
    }

    setIsDownloadingBrief(true);
    launchConfetti();
    generateInvestorBrief(session.briefContent, session.startupIdea, scorecard);
    await wait(250);
    setIsDownloadingBrief(false);
  };

  const handleStartOver = () => {
    if (!window.confirm("Start over and wipe the current pitch session?")) {
      return;
    }

    hardReset();
  };

  const handlePitchAgain = () => {
    hardReset();
    router.push("/");
  };

  const roundLabel =
    session.mode === "defending"
      ? isSubmittingDefense
        ? "Round 2 / 2"
        : "Round 1 complete"
      : "Round 1 / 2";

  return (
    <main className="min-h-screen text-[#1f2933]">
      <ModeFlip active={isModeFlipActive} />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 lg:px-14">
        <header className="surface-card flex flex-col gap-4 rounded-[26px] p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="font-mono text-xs tracking-[0.22em] text-[#2f6e78]"
            >
              PitchPK
            </Link>
            <p className="text-sm text-[#5b6774]">
              Brutal investor questions first. Useful clarity second.
            </p>
          </div>

          {session.mode !== "idle" ? (
            <button
              onClick={handleStartOver}
              className="ghost-btn rounded-full px-5 py-3 text-sm font-semibold tracking-[0.14em] transition"
            >
              Start Over
            </button>
          ) : (
            <p className="font-mono text-xs tracking-[0.16em] text-[#6f7b89]">
              Brutal clarity. Better storytelling.
            </p>
          )}
        </header>

        {session.mode === "idle" ? (
          <IdeaForm
            value={session.startupIdea}
            placeholder={PLACEHOLDERS[placeholderIndex]}
            wordCount={wordCount}
            isLoading={isSubmittingIdea}
            showWarning={showIdeaWarning}
            isShaking={isIdeaShaking}
            onChange={setStartupIdea}
            onSubmit={handleIdeaSubmit}
          />
        ) : null}

        {(session.mode === "roasting" || session.mode === "defending") && (
          <RoastSession
            personas={PERSONAS}
            personaMessages={session.personaMessages}
            personaStatuses={session.personaStatuses}
            revealedPersonaIds={revealedPersonaIds}
            activeCatchphrasePersonaId={activeCatchphrasePersonaId}
            introEmojiCount={introEmojiCount}
            showAssemblyOverlay={showAssemblyOverlay}
            showLaunchText={showLaunchText}
            showDefendInput={session.mode === "defending" && !isSubmittingDefense}
            defenseValue={defenseInput}
            defenseBusy={isSubmittingDefense}
            intensityValue={roastIntensity}
            roundLabel={roundLabel}
            onDefenseChange={setDefenseInput}
            onDefenseSubmit={handleDefenseSubmit}
          />
        )}

        {session.mode === "mentor" && (
          <MentorSession
            personas={PERSONAS}
            personaMessages={session.personaMessages}
            personaStatuses={session.personaStatuses}
            revealedPersonaIds={revealedPersonaIds}
            activeCatchphrasePersonaId={activeCatchphrasePersonaId}
            intensityValue={mentorIntensity}
          />
        )}

        {session.mode === "brief" && (
          <BriefExport
            briefText={session.briefContent}
            startupIdea={session.startupIdea}
            scorecard={scorecard}
            isGenerating={isGeneratingBrief}
            isDownloading={isDownloadingBrief}
            onGenerate={handleGenerateBrief}
            onDownload={handleDownloadBrief}
            onPitchAgain={handlePitchAgain}
          />
        )}
      </div>
    </main>
  );
}
