import type { FormEvent } from "react";
import { IdeaSuggestions } from "@/components/IdeaSuggestions";

interface IdeaFormProps {
  value: string;
  placeholder: string;
  wordCount: number;
  isLoading: boolean;
  showWarning: boolean;
  isShaking: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function IdeaForm({
  value,
  placeholder,
  wordCount,
  isLoading,
  showWarning,
  isShaking,
  onChange,
  onSubmit,
}: IdeaFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-10 mt-4">
      <div className="relative group rounded-[40px] p-8 md:p-12 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(47,110,120,0.06)] hover:bg-white/80 overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-[#2f6e78]/10 to-transparent rounded-full blur-3xl opacity-50 point-events-none" />

        <div className="relative z-10 space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2f6e78]/20 bg-[#f2f8fa] px-3 py-1 mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#2f6e78] font-bold">
              Founders Only
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1f2933] md:text-5xl lg:text-6xl [font-family:var(--font-display)] pb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#1f2933] to-[#2f6e78]">
            Face the panel.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[#5b6774]">
            Describe your startup idea. Don&apos;t hold back. The better the
            details, the sharper the questions.
          </p>
        </div>

        <form className="relative z-10 space-y-6" onSubmit={handleSubmit}>
          <div
            className={`rounded-[32px] border bg-white/90 p-5 transition-all duration-300 shadow-inner ${isShaking ? "animate-shake border-[#2f6e78]/70" : "border-[#1f2933]/10 focus-within:border-[#2f6e78]/40 focus-within:ring-4 focus-within:ring-[#2f6e78]/5"}`}
          >
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              rows={8}
              disabled={isLoading}
              className="min-h-[200px] w-full resize-none bg-transparent text-lg md:text-xl leading-relaxed text-[#1f2933] outline-none placeholder:text-[#8a95a3]/70 font-medium"
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
            <div className="space-y-1.5 pl-2">
              <p className="font-mono text-[11px] tracking-[0.15em] text-[#6f7b89] uppercase font-semibold">
                {wordCount} words <span className="opacity-50 mx-1">|</span> <span className="opacity-75">Aim for 50-300</span>
              </p>
              {showWarning ? (
                <p className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block">
                  ⚠️ Yaar, give us something to work with.
                </p>
              ) : (
                <p className="text-[13px] text-[#6f7b89] max-w-sm leading-snug">
                  Specific users, business model, and why-now context help the
                  panel roast properly.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="primary-btn shimmer-button relative inline-flex h-14 min-w-[200px] items-center justify-center overflow-hidden rounded-full px-8 text-[15px] font-bold tracking-[0.1em] text-white transition-all disabled:opacity-70 shadow-lg shadow-[#2f6e78]/20 hover:shadow-xl hover:shadow-[#2f6e78]/30 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? "Summoning panel..." : "Face the Panel →"}
              </span>
            </button>
          </div>
        </form>
      </div>

      <IdeaSuggestions idea={value} isLoading={isLoading} />
    </section>
  );
}
