"use client";

import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

import type { Persona, PersonaStatus } from "@/types";

interface PersonaCardProps {
  persona: Persona;
  status: PersonaStatus;
  message: string;
  mode: "roast" | "mentor";
  showCatchphraseFlash?: boolean;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-2.5 w-2.5 rounded-full bg-white/75"
          animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.7,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
}

export function PersonaCard({
  persona,
  status,
  message,
  mode,
  showCatchphraseFlash = false,
}: PersonaCardProps) {
  const isWaiting = status === "waiting";
  const isThinking = status === "thinking";
  const isSpeaking = status === "speaking";
  const isDone = status === "done";
  const cardTone =
    mode === "roast"
      ? `${persona.accentColor} bg-[#111111]`
      : "border-white/20 bg-[#161410] text-[#F0EDE6]";

  return (
    <article
      className={`relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-[28px] border p-5 transition duration-300 md:min-h-[410px] ${cardTone} ${isWaiting ? "opacity-40" : "opacity-100"}`}
      style={{
        boxShadow:
          mode === "roast"
            ? `0 0 20px rgba(${persona.glowColor}, 0.15)`
            : `0 0 22px rgba(${persona.glowColor}, 0.1)`,
      }}
    >
      <AnimatePresence>
        {showCatchphraseFlash ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.78 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/72 p-6 text-center"
          >
            <p className="text-3xl font-black uppercase tracking-[-0.05em] text-[#F0EDE6] md:text-4xl [font-family:var(--font-display)]">
              {persona.catchphrase}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div
            className={`text-4xl transition ${isWaiting ? "grayscale" : ""} ${isThinking ? "animate-bounce" : ""}`}
          >
            {persona.emoji}
          </div>
          <div className="space-y-1">
            <p className="text-lg leading-none font-black uppercase tracking-[-0.03em] md:text-xl [font-family:var(--font-display)]">
              {persona.name}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
              {persona.title}
            </p>
            <p className="max-w-[22ch] text-sm leading-6 text-white/55">
              {persona.catchphrase}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
          {mode === "roast" ? "Roast" : "Mentor"}
        </span>
      </div>

      <div className="mt-6 flex flex-1">
        <div className="flex w-full flex-1 rounded-[22px] border border-white/8 bg-black/25 p-4">
          {isThinking ? (
            <div className="flex h-full min-h-[150px] items-center justify-center">
              <TypingDots />
            </div>
          ) : message ? (
            <div className="markdown-stream min-h-[170px] max-h-[230px] overflow-y-auto pr-1 text-sm leading-7 text-white/85 md:max-h-[250px] md:text-[15px]">
              <ReactMarkdown>{message}</ReactMarkdown>
              {isSpeaking ? (
                <span className="ml-1 inline-block animate-blink text-[#E04020]">
                  |
                </span>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[170px] items-center text-sm leading-7 text-white/28">
              Standing by for their turn.
            </div>
          )}
        </div>
      </div>

      {isDone ? (
        <div className="mt-4 flex justify-end">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
            ✓ Done
          </span>
        </div>
      ) : null}
    </article>
  );
}
