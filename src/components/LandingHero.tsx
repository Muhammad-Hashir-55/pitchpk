import Link from "next/link";

import { PERSONAS } from "@/lib/personas";

const tickerCopy =
  "BRUTAL FEEDBACK · REAL QUESTIONS · PAKISTAN'S TOUGHEST VCS · MENTOR MODE · FREE TO USE · ";

export function LandingHero() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
      <div className="pointer-events-none absolute -left-24 top-4 h-80 w-80 rounded-full bg-[#2f6e78]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-24 h-96 w-96 rounded-full bg-[#9b7456]/14 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-24 pt-10 md:px-10 lg:px-14">
        <div className="flex items-center justify-between text-xs tracking-[0.22em] text-[#5b6774]">
          <span className="font-mono">PitchPK</span>
          <span className="font-mono">Investor Pressure Simulator</span>
        </div>

        <section className="flex flex-1 flex-col justify-center gap-10 py-10">
          <div className="max-w-5xl space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#2f6e78]/30 bg-white/75 px-4 py-2 font-mono text-[11px] tracking-[0.24em] text-[#2f6e78]">
              Live Gemini Investor Panel
            </p>
            <div className="space-y-5">
              <h1 className="text-6xl font-semibold tracking-[-0.04em] text-[#1f2933] sm:text-7xl md:text-8xl [font-family:var(--font-display)]">
                Pitch
                <span className="text-[#2f6e78]">PK</span>
              </h1>
              <p className="max-w-3xl text-xl text-[#4e5966] md:text-2xl">
                Your sharpest pre-investor rehearsal room.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[#5b6774] md:text-lg">
              Practice with three AI investor personas that question your
              assumptions, pressure-test your market logic, and help you walk
              into real meetings with cleaner answers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PERSONAS.map((persona, index) => (
              <article
                key={persona.id}
                className="surface-card animate-float rounded-3xl p-5"
                style={{
                  animationDelay: `${index * 150}ms`,
                  boxShadow: `0 18px 34px rgba(${persona.glowColor}, 0.12)`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#9ea8b6]/25 bg-white/75 text-3xl">
                    {persona.emoji}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold [font-family:var(--font-display)]">
                      {persona.name}
                    </p>
                    <p className="font-mono text-[11px] tracking-[0.16em] text-[#6f7b89]">
                      {persona.title}
                    </p>
                    <p className="pt-2 text-sm text-[#5d6876]">
                      {persona.catchphrase}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
            <Link
              href="/pitch"
              className="primary-btn shimmer-button relative inline-flex overflow-hidden rounded-full px-7 py-4 text-sm font-semibold tracking-[0.14em] transition-transform duration-300"
            >
              <span className="relative z-10">Start a Session</span>
            </Link>
            <p className="font-mono text-xs tracking-[0.16em] text-[#6f7b89]">
              Two rounds of pressure, one polished brief.
            </p>
          </div>
        </section>
      </div>

      <div className="ticker-mask absolute inset-x-0 bottom-0 border-t border-[#1f2933]/10 bg-[#fbf7f1]/85 py-4 backdrop-blur">
        <div className="animate-marquee flex w-max whitespace-nowrap font-mono text-sm tracking-[0.22em] text-[#2f6e78]">
          <span>{tickerCopy.repeat(4)}</span>
          <span>{tickerCopy.repeat(4)}</span>
        </div>
      </div>
    </main>
  );
}
