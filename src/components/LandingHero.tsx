import Link from "next/link";

import { PERSONAS } from "@/lib/personas";

const tickerCopy =
  "BRUTAL FEEDBACK · REAL QUESTIONS · PAKISTAN'S TOUGHEST VCS · MENTOR MODE · FREE TO USE · ";

export function LandingHero() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080808] text-[#F0EDE6]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(224,64,32,0.15),_transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-24 pt-10 md:px-10 lg:px-14">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/45">
          <span className="font-mono">PitchPK</span>
          <span className="font-mono">Investor Pressure Test</span>
        </div>

        <section className="flex flex-1 flex-col justify-center gap-10 py-10">
          <div className="max-w-5xl space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#E04020]/35 bg-[#E04020]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#E04020]">
              Live Gemini Investor Panel
            </p>
            <div className="space-y-5">
              <h1 className="text-7xl font-black uppercase tracking-[-0.06em] sm:text-8xl md:text-9xl [font-family:var(--font-display)]">
                Pitch
                <span className="text-[#E04020]">PK</span>
              </h1>
              <p className="max-w-3xl text-2xl italic text-[#F0EDE6]/80 md:text-3xl">
                The brutally honest co-founder you can&apos;t afford to hire
                yet.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-white/65 md:text-lg">
              Step into a dark room with three unforgiving AI investors. They
              will tear into your assumptions, pressure-test your market, and
              then help you rebuild the pitch you should have brought in the
              first place.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PERSONAS.map((persona, index) => (
              <article
                key={persona.id}
                className="animate-float rounded-3xl border border-white/10 bg-[#111111]/85 p-5 backdrop-blur"
                style={{
                  animationDelay: `${index * 150}ms`,
                  boxShadow: `0 0 30px rgba(${persona.glowColor}, 0.1)`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-3xl">
                    {persona.emoji}
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold [font-family:var(--font-display)]">
                      {persona.name}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                      {persona.title}
                    </p>
                    <p className="pt-2 text-sm text-white/65">
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
              className="shimmer-button relative inline-flex overflow-hidden rounded-full border border-[#E04020]/45 bg-[#E04020] px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#080808] shadow-[0_0_28px_rgba(224,64,32,0.25)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(224,64,32,0.35)]"
            >
              <span className="relative z-10">Roast My Idea →</span>
            </Link>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              2 rounds of pain. 1 page of clarity.
            </p>
          </div>
        </section>
      </div>

      <div className="ticker-mask absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/25 py-4 backdrop-blur">
        <div className="animate-marquee flex w-max whitespace-nowrap font-mono text-sm uppercase tracking-[0.28em] text-[#E04020]/90">
          <span>{tickerCopy.repeat(4)}</span>
          <span>{tickerCopy.repeat(4)}</span>
        </div>
      </div>
    </main>
  );
}
