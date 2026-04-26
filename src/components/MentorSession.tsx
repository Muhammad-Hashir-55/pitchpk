"use client";

import { motion } from "framer-motion";

import { PersonaCard } from "@/components/PersonaCard";
import type { Persona, PersonaStatus } from "@/types";

interface MentorSessionProps {
  personas: Persona[];
  personaMessages: Record<string, string>;
  personaStatuses: Record<string, PersonaStatus>;
  revealedPersonaIds: string[];
  activeCatchphrasePersonaId: string | null;
  intensityValue: number;
}

export function MentorSession({
  personas,
  personaMessages,
  personaStatuses,
  revealedPersonaIds,
  activeCatchphrasePersonaId,
  intensityValue,
}: MentorSessionProps) {
  return (
    <section className="space-y-8">
      <div className="surface-card-alt flex flex-col gap-4 rounded-[28px] p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs tracking-[0.22em] text-[#2f6e78]">
            Mentor Mode
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#1f2933] [font-family:var(--font-display)]">
            Enough roasting. Let&apos;s fix this.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[#5b6774]">
          Same investors, warmer tone. Now they help tighten the story, the
          numbers, and the product wedge.
        </p>
      </div>

      <div className="surface-card rounded-[26px] p-4 backdrop-blur md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[11px] tracking-[0.2em] text-[#6f7b89]">
              Roast Intensity
            </p>
            <p className="max-w-xl text-sm leading-6 text-[#5b6774]">
              Calmer, but still brutally useful. The mentors now get full-width
              breathing room too.
            </p>
          </div>
          <p className="font-mono text-xs tracking-[0.15em] text-[#6f7b89]">
            Advice is loading
          </p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full border border-[#1f2933]/12 bg-[#e6eaef]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#24565e] via-[#2f6e78] to-[#8bb2b8]"
            animate={{ width: `${Math.max(8, intensityValue)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {personas.map((persona) => {
          const isRevealed = revealedPersonaIds.includes(persona.id);

          if (!isRevealed) {
            return (
              <div
                key={persona.id}
                className="hidden min-h-[380px] rounded-[28px] border border-dashed border-[#1f2933]/15 bg-white/35 xl:block"
              />
            );
          }

          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <PersonaCard
                persona={persona}
                status={personaStatuses[persona.id]}
                message={personaMessages[persona.id]}
                mode="mentor"
                showCatchphraseFlash={activeCatchphrasePersonaId === persona.id}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
