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
      ? `${persona.accentColor} bg-[#fbf8f2]`
      : "border-[#1f2933]/15 bg-[#f8f5ef] text-[#1f2933]";

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
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#1b2732]/86 p-6 text-center"
          >
            <p className="text-3xl font-semibold tracking-[-0.02em] text-[#f4fbff] md:text-4xl [font-family:var(--font-display)]">
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
            <p className="text-xl leading-none font-semibold tracking-[-0.02em] md:text-2xl [font-family:var(--font-display)]">
              {persona.name}
            </p>
            <p className="font-mono text-[11px] tracking-[0.14em] text-[#6f7b89]">
              {persona.title}
            </p>
            <p className="max-w-[22ch] text-sm leading-6 text-[#5b6774]">
              {persona.catchphrase}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[#1f2933]/12 bg-white/65 px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-[#6f7b89]">
          {mode === "roast" ? "Roast" : "Mentor"}
        </span>
      </div>

      <div className="mt-6 flex flex-1">
        <div className="flex w-full flex-1 rounded-[22px] border border-[#1f2933]/12 bg-white/70 p-4">
          {isThinking ? (
            <div className="flex h-full min-h-[150px] items-center justify-center">
              <TypingDots />
            </div>
          ) : message ? (
            <div className="markdown-stream min-h-[170px] max-h-[230px] overflow-y-auto pr-1 text-sm leading-7 text-[#1f2933]/90 md:max-h-[250px] md:text-[15px]">
              <ReactMarkdown>{message}</ReactMarkdown>
              {isSpeaking ? (
                <span className="ml-1 inline-block animate-blink text-[#2f6e78]">
                  |
                </span>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[170px] items-center text-sm leading-7 text-[#6f7b89]">
              Standing by for their turn.
            </div>
          )}
        </div>
      </div>

      {isDone ? (
        <div className="mt-4 flex justify-end">
          <span className="font-mono text-[11px] tracking-[0.16em] text-[#6f7b89]">
            ✓ Done
          </span>
        </div>
      ) : null}
    </article>
  );
}
