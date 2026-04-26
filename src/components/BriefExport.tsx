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
  tone = "text-[#1f2933]",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="surface-card-alt rounded-[24px] p-4">
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#6f7b89]">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-semibold tracking-[-0.02em] [font-family:var(--font-display)] ${tone}`}
      >
        {value}
      </p>
    </div>
  );
}

function ScoreOverview({ scorecard }: { scorecard: PitchScorecard }) {
  const readinessTone =
    scorecard.overall >= 75
      ? "text-emerald-700"
      : scorecard.overall >= 60
        ? "text-amber-700"
        : "text-[#b53e24]";

  return (
    <div className="surface-card space-y-5 rounded-[32px] p-6">
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-[#2f6e78]/20 bg-[#f4f9fa] p-5">
          <p className="font-mono text-[11px] tracking-[0.2em] text-[#2f6e78]">
            Investor Readiness
          </p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-7xl font-black tracking-[-0.08em] [font-family:var(--font-display)]">
              {scorecard.overall}
            </span>
            <span className="pb-2 font-mono text-sm tracking-[0.16em] text-[#6f7b89]">
              /100
            </span>
          </div>
          <p className={`mt-3 text-lg font-semibold ${readinessTone}`}>
            {scorecard.readinessLabel}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#5b6774]">
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
                  ? "text-emerald-700"
                  : "text-[#b53e24]"
              }
            />
            <ScoreBadge
              label="Roast Temperature"
              value={`${scorecard.roastTemperature}%`}
              tone={
                scorecard.roastTemperature >= 75
                  ? "text-[#b53e24]"
                  : "text-amber-700"
              }
            />
            <ScoreBadge
              label="Questions Dodged"
              value={`${scorecard.questionsDodged}`}
              tone={
                scorecard.questionsDodged === 0
                  ? "text-emerald-700"
                  : "text-[#2d1b14]"
              }
            />
            <ScoreBadge
              label="Evidence Density"
              value={`${scorecard.evidenceScore}%`}
              tone={
                scorecard.evidenceScore >= 60
                  ? "text-emerald-700"
                  : "text-[#2d1b14]"
              }
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="surface-card-alt rounded-[24px] p-4">
              <p className="font-mono text-[11px] tracking-[0.18em] text-[#6f7b89]">
                Strongest Signal
              </p>
              <p className="mt-2 text-sm leading-7 text-[#1f2933]/85">
                {scorecard.strongestSignal}
              </p>
            </div>
            <div className="surface-card-alt rounded-[24px] p-4">
              <p className="font-mono text-[11px] tracking-[0.18em] text-[#6f7b89]">
                Biggest Risk
              </p>
              <p className="mt-2 text-sm leading-7 text-[#1f2933]/85">
                {scorecard.biggestRisk}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="surface-card-alt rounded-[24px] p-5">
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#6f7b89]">
            Score Breakdown
          </p>
          <div className="mt-4 space-y-4">
            {scorecard.dimensions.map((dimension) => (
              <div key={dimension.id} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#2d1b14]/88">
                    {dimension.label}
                  </p>
                  <p className="font-mono text-xs tracking-[0.14em] text-[#6f7b89]">
                    {dimension.score}/100
                  </p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full border border-[#1f2933]/12 bg-[#e6eaef]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#24565e] via-[#2f6e78] to-[#8bb2b8]"
                    style={{ width: `${dimension.score}%` }}
                  />
                </div>
                <p className="text-sm leading-6 text-[#5b6774]">
                  {dimension.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card-alt rounded-[24px] p-5">
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#6f7b89]">
            Panel Pressure Map
          </p>
          <div className="mt-4 space-y-4">
            {scorecard.personaBreakdown.map((persona) => (
              <div
                key={persona.personaId}
                className="rounded-[20px] border border-[#1f2933]/12 bg-white/72 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#2d1b14]/88">
                    {persona.name}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] ${
                      persona.defended
                        ? "border border-emerald-700/25 bg-emerald-600/10 text-emerald-800"
                        : "border border-[#c54b2d]/25 bg-[#c54b2d]/10 text-[#9f3218]"
                    }`}
                  >
                    {persona.defended ? "Addressed" : "Dodged"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#1f2933]/78">
                  {persona.issue}
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="font-mono text-[11px] tracking-[0.14em] text-[#6f7b89]">
                    {persona.themes.join(" · ")}
                  </p>
                  <p className="font-mono text-[11px] tracking-[0.14em] text-[#6f7b89]">
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
        <p className="font-mono text-xs tracking-[0.22em] text-[#2f6e78]">
          Endgame
        </p>
        <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#1f2933] [font-family:var(--font-display)]">
          Investor brief
        </h2>
        <p className="max-w-3xl text-base leading-7 text-[#5b6774]">
          You survived the panel. Package the signal into a clean one-pager and
          take the smarter version of your startup story into the next room.
        </p>
      </div>

      <ScoreOverview scorecard={scorecard} />

      {!briefText ? (
        <div className="surface-card rounded-[32px] p-8 text-center">
          <p className="mx-auto max-w-2xl text-base leading-7 text-[#5b6774]">
            Generate a structured investor brief from the full roast and mentor
            transcript. Then download it as a dark, one-page PDF.
          </p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="primary-btn shimmer-button relative mt-6 inline-flex overflow-hidden rounded-full px-7 py-4 text-sm font-semibold tracking-[0.14em] transition disabled:opacity-60"
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
          <div className="surface-card rounded-[32px] p-6">
            <div className="flex flex-col gap-2 border-b border-[#1f2933]/10 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-xs tracking-[0.2em] text-[#2f6e78]">
                  PitchPK
                </p>
                <h3 className="text-3xl font-semibold tracking-[-0.02em] text-[#1f2933] [font-family:var(--font-display)]">
                  {sections["STARTUP NAME"] || "Investor Brief"}
                </h3>
              </div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-[#6f7b89]">
                Dark PDF preview
              </p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {briefSections.map((section) => (
                <div key={section} className="space-y-2">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-[#2f6e78]">
                    {section}
                  </p>
                  <div className="markdown-brief text-sm leading-7 text-[#1f2933]/85">
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
              className="primary-btn shimmer-button relative inline-flex overflow-hidden rounded-full px-7 py-4 text-sm font-semibold tracking-[0.14em] transition disabled:opacity-60"
            >
              <span className="relative z-10">
                {isDownloading
                  ? "Launching confetti..."
                  : "Download Investor Brief"}
              </span>
            </button>
            <button
              onClick={onPitchAgain}
              className="ghost-btn rounded-full px-7 py-4 text-sm font-semibold tracking-[0.14em] transition"
            >
              Pitch Again
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
