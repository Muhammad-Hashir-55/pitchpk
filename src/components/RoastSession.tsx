"use client";

import { AnimatePresence, motion } from "framer-motion";

import { DefendInput } from "@/components/DefendInput";
import { PersonaCard } from "@/components/PersonaCard";
import type { Persona, PersonaStatus } from "@/types";

interface RoastSessionProps {
  personas: Persona[];
  personaMessages: Record<string, string>;
  personaStatuses: Record<string, PersonaStatus>;
  revealedPersonaIds: string[];
  activeCatchphrasePersonaId: string | null;
  introEmojiCount: number;
  showAssemblyOverlay: boolean;
  showLaunchText: boolean;
  showDefendInput: boolean;
  defenseValue: string;
  defenseBusy: boolean;
  intensityValue: number;
  roundLabel: string;
  onDefenseChange: (value: string) => void;
  onDefenseSubmit: () => void;
}

function IntensityMeter({
  label,
  value,
  barClassName,
}: {
  label: string;
  value: number;
  barClassName: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[#111111]/90 p-4 backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/45">
            Roast Intensity
          </p>
          <p className="max-w-xl text-sm leading-6 text-white/65">{label}</p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/35">
          Panel pressure rising
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full border border-white/10 bg-black/35">
        <motion.div
          className={`h-full rounded-full ${barClassName}`}
          animate={{ width: `${Math.max(8, value)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function RoastSession({
  personas,
  personaMessages,
  personaStatuses,
  revealedPersonaIds,
  activeCatchphrasePersonaId,
  introEmojiCount,
  showAssemblyOverlay,
  showLaunchText,
  showDefendInput,
  defenseValue,
  defenseBusy,
  intensityValue,
  roundLabel,
  onDefenseChange,
  onDefenseSubmit,
}: RoastSessionProps) {
  return (
    <section className="relative space-y-8">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[#E04020]/25 bg-[#110d0c]/85 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-[#E04020]">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#E04020]" />
            Roast Session In Progress
          </div>
          <h2 className="text-3xl font-black uppercase tracking-[-0.05em] [font-family:var(--font-display)]">
            Pressure test in public.
          </h2>
        </div>
        <p className="rounded-full border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
          {roundLabel}
        </p>
      </div>

      <IntensityMeter
        label="Each investor pushes the heat higher. Full-width cards below give the panel room to finish the thought."
        value={intensityValue}
        barClassName="bg-gradient-to-r from-[#6f1205] via-[#E04020] to-[#ffb09b]"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {personas.map((persona) => {
          const isRevealed = revealedPersonaIds.includes(persona.id);

          if (!isRevealed) {
            return (
              <div
                key={persona.id}
                className="hidden min-h-[380px] rounded-[28px] border border-dashed border-white/8 bg-white/[0.02] xl:block"
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
                mode="roast"
                showCatchphraseFlash={activeCatchphrasePersonaId === persona.id}
              />
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showDefendInput ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="sticky bottom-4 z-20"
          >
            <DefendInput
              value={defenseValue}
              isBusy={defenseBusy}
              onChange={onDefenseChange}
              onSubmit={onDefenseSubmit}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showAssemblyOverlay ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#080808]/94 px-6 backdrop-blur"
          >
            <div className="space-y-6 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#E04020]">
                The panel is assembling...
              </p>
              <div className="flex items-center justify-center gap-5 text-5xl md:text-6xl">
                {personas.slice(0, introEmojiCount).map((persona) => (
                  <motion.span
                    key={persona.id}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {persona.emoji}
                  </motion.span>
                ))}
              </div>
              {showLaunchText ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.6, 1] }}
                  className="text-3xl font-black uppercase tracking-[-0.04em] text-[#E04020] md:text-5xl [font-family:var(--font-display)]"
                >
                  Let the roasting begin
                </motion.p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
