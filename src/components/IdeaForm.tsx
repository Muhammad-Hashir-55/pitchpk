import type { FormEvent } from "react";

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
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-[32px] border border-white/10 bg-[#111111]/88 p-6 shadow-[0_0_50px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#E04020]">
          Founders only
        </p>
        <h1 className="text-4xl font-black uppercase tracking-[-0.05em] md:text-6xl [font-family:var(--font-display)]">
          Face the panel.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/65">
          Describe your startup idea. Don&apos;t hold back. The better the
          details, the sharper the questions.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div
          className={`rounded-[28px] border bg-black/25 p-4 transition ${isShaking ? "animate-shake border-[#E04020]/70" : "border-white/10"}`}
        >
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={10}
            disabled={isLoading}
            className="min-h-[240px] w-full resize-none bg-transparent text-base leading-7 text-[#F0EDE6] outline-none placeholder:text-white/25 md:text-lg"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">
              {wordCount} words · Aim for 50-300 words
            </p>
            {showWarning ? (
              <p className="text-sm text-[#E04020]">
                Yaar, give us something to work with.
              </p>
            ) : (
              <p className="text-sm text-white/45">
                Specific users, business model, and why-now context help the
                panel roast properly.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="shimmer-button relative inline-flex min-w-[220px] items-center justify-center overflow-hidden rounded-full border border-[#E04020]/45 bg-[#E04020] px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-[#080808] shadow-[0_0_24px_rgba(224,64,32,0.22)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            <span className="relative z-10">
              {isLoading ? "Summoning the panel..." : "Face the Panel →"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}
