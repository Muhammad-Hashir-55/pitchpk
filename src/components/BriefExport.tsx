"use client";

import ReactMarkdown from "react-markdown";

import { parseBriefSections } from "@/lib/pdfGenerator";
import type { PitchScorecard } from "@/types";

interface BriefExportProps {
  briefText: string;
  startupIdea: string;
  scorecard: PitchScorecard;
  isGenerating: boolean;
  isDownloading: boolean;
  onGenerate: () => void;
  onDownload: () => void;
  onPitchAgain: () => void;
}

const briefSections = [
  "STARTUP NAME",
  "PROBLEM",
  "SOLUTION",
  "TARGET MARKET",
  "BUSINESS MODEL",
  "KEY RISKS",
  "WHAT TO DO NEXT",
] as const;

function ScoreBadge({
  label,
  value,
  tone = "text-white",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#111111]/85 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-black uppercase tracking-[-0.04em] [font-family:var(--font-display)] ${tone}`}
      >
        {value}
      </p>
    </div>
  );
}

function ScoreOverview({ scorecard }: { scorecard: PitchScorecard }) {
  const readinessTone =
    scorecard.overall >= 75
      ? "text-emerald-300"
      : scorecard.overall >= 60
        ? "text-amber-300"
        : "text-[#E04020]";

  return (
    <div className="space-y-5 rounded-[32px] border border-white/10 bg-[#111111]/92 p-6 shadow-[0_0_50px_rgba(0,0,0,0.35)]">
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-[#E04020]/25 bg-[#130d0b] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#E04020]">
            Investor Readiness
          </p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-7xl font-black tracking-[-0.08em] [font-family:var(--font-display)]">
              {scorecard.overall}
            </span>
            <span className="pb-2 font-mono text-sm uppercase tracking-[0.2em] text-white/45">
              /100
            </span>
          </div>
          <p className={`mt-3 text-lg font-bold uppercase ${readinessTone}`}>
            {scorecard.readinessLabel}
          </p>
          <p className="mt-3 text-sm leading-7 text-white/68">
            {scorecard.verdict}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ScoreBadge
              label="Survival Rate"
              value={`${scorecard.survivalRate}%`}
              tone={
                scorecard.survivalRate >= 65
                  ? "text-emerald-300"
                  : "text-[#E04020]"
              }
            />
            <ScoreBadge
              label="Roast Temperature"
              value={`${scorecard.roastTemperature}%`}
              tone={
                scorecard.roastTemperature >= 75
                  ? "text-[#E04020]"
                  : "text-amber-300"
              }
            />
            <ScoreBadge
              label="Questions Dodged"
              value={`${scorecard.questionsDodged}`}
              tone={
                scorecard.questionsDodged === 0
                  ? "text-emerald-300"
                  : "text-white"
              }
            />
            <ScoreBadge
              label="Evidence Density"
              value={`${scorecard.evidenceScore}%`}
              tone={
                scorecard.evidenceScore >= 60
                  ? "text-emerald-300"
                  : "text-white"
              }
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                Strongest Signal
              </p>
              <p className="mt-2 text-sm leading-7 text-white/80">
                {scorecard.strongestSignal}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                Biggest Risk
              </p>
              <p className="mt-2 text-sm leading-7 text-white/80">
                {scorecard.biggestRisk}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
            Score Breakdown
          </p>
          <div className="mt-4 space-y-4">
            {scorecard.dimensions.map((dimension) => (
              <div key={dimension.id} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white/88">
                    {dimension.label}
                  </p>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">
                    {dimension.score}/100
                  </p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B2010] via-[#E04020] to-[#f5b19e]"
                    style={{ width: `${dimension.score}%` }}
                  />
                </div>
                <p className="text-sm leading-6 text-white/58">
                  {dimension.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
            Panel Pressure Map
          </p>
          <div className="mt-4 space-y-4">
            {scorecard.personaBreakdown.map((persona) => (
              <div
                key={persona.personaId}
                className="rounded-[20px] border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white/88">
                    {persona.name}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
                      persona.defended
                        ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                        : "border border-[#E04020]/25 bg-[#E04020]/10 text-[#ffb19f]"
                    }`}
                  >
                    {persona.defended ? "Addressed" : "Dodged"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  {persona.issue}
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
                    {persona.themes.join(" · ")}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Pressure {persona.severity}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BriefExport({
  briefText,
  startupIdea,
  scorecard,
  isGenerating,
  isDownloading,
  onGenerate,
  onDownload,
  onPitchAgain,
}: BriefExportProps) {
  const sections = parseBriefSections(briefText || startupIdea);

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#E04020]">
          Endgame
        </p>
        <h2 className="text-4xl font-black uppercase tracking-[-0.05em] [font-family:var(--font-display)]">
          Investor brief
        </h2>
        <p className="max-w-3xl text-base leading-7 text-white/65">
          You survived the panel. Package the signal into a clean one-pager and
          take the smarter version of your startup story into the next room.
        </p>
      </div>

      <ScoreOverview scorecard={scorecard} />

      {!briefText ? (
        <div className="rounded-[32px] border border-white/10 bg-[#111111]/88 p-8 text-center">
          <p className="mx-auto max-w-2xl text-base leading-7 text-white/65">
            Generate a structured investor brief from the full roast and mentor
            transcript. Then download it as a dark, one-page PDF.
          </p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="shimmer-button relative mt-6 inline-flex overflow-hidden rounded-full border border-[#E04020]/45 bg-[#E04020] px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#080808] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            <span className="relative z-10">
              {isGenerating
                ? "Drafting your brief..."
                : "Generate Investor Brief"}
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-[32px] border border-white/10 bg-[#111111]/92 p-6 shadow-[0_0_50px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#E04020]">
                  PitchPK
                </p>
                <h3 className="text-3xl font-black uppercase tracking-[-0.05em] [font-family:var(--font-display)]">
                  {sections["STARTUP NAME"] || "Investor Brief"}
                </h3>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
                Dark PDF preview
              </p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {briefSections.map((section) => (
                <div key={section} className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#E04020]">
                    {section}
                  </p>
                  <div className="markdown-brief text-sm leading-7 text-white/80">
                    <ReactMarkdown>
                      {sections[section] || "Not enough data from the session."}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="shimmer-button relative inline-flex overflow-hidden rounded-full border border-[#E04020]/45 bg-[#E04020] px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#080808] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              <span className="relative z-10">
                {isDownloading
                  ? "Launching confetti..."
                  : "Download Investor Brief"}
              </span>
            </button>
            <button
              onClick={onPitchAgain}
              className="rounded-full border border-white/12 bg-white/[0.04] px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white/75 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              Pitch Again
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
