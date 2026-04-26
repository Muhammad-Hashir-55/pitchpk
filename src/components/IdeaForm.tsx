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
    <section className="mx-auto w-full max-w-4xl space-y-8">
      <div className="surface-card flex flex-col gap-8 rounded-[32px] p-6 backdrop-blur md:p-8">
        <div className="space-y-3">
          <p className="font-mono text-xs tracking-[0.22em] text-[#2f6e78]">
            Founders only
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#1f2933] md:text-6xl [font-family:var(--font-display)]">
            Face the panel.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#5b6774]">
            Describe your startup idea. Don&apos;t hold back. The better the
            details, the sharper the questions.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div
            className={`rounded-[28px] border bg-white/70 p-4 transition ${isShaking ? "animate-shake border-[#2f6e78]/70" : "border-[#1f2933]/14"}`}
          >
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              rows={10}
              disabled={isLoading}
              className="min-h-[240px] w-full resize-none bg-transparent text-base leading-7 text-[#1f2933] outline-none placeholder:text-[#8a95a3] md:text-lg"
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xs tracking-[0.15em] text-[#6f7b89]">
                {wordCount} words · Aim for 50-300 words
              </p>
              {showWarning ? (
                <p className="text-sm text-[#2f6e78]">
                  Yaar, give us something to work with.
                </p>
              ) : (
                <p className="text-sm text-[#6f7b89]">
                  Specific users, business model, and why-now context help the
                  panel roast properly.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="primary-btn shimmer-button relative inline-flex min-w-[220px] items-center justify-center overflow-hidden rounded-full px-6 py-4 text-sm font-semibold tracking-[0.14em] transition disabled:opacity-60"
            >
              <span className="relative z-10">
                {isLoading ? "Summoning the panel..." : "Face the Panel →"}
              </span>
            </button>
          </div>
        </form>
      </div>

      <IdeaSuggestions idea={value} isLoading={isLoading} />
    </section>
  );
}
