import type { FormEvent } from "react";

interface DefendInputProps {
  value: string;
  isBusy: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function DefendInput({
  value,
  isBusy,
  onChange,
  onSubmit,
}: DefendInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="rounded-[28px] border border-[#E04020]/30 bg-[#110a08]/95 p-5 shadow-[0_-20px_50px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#E04020]">
          Defend Yourself
        </p>
        <h2 className="text-2xl font-black uppercase tracking-[-0.04em] [font-family:var(--font-display)]">
          The panel has spoken. Now defend your idea.
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-3 md:flex-row"
      >
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Tell them why they're wrong."
          disabled={isBusy}
          className="flex-1 rounded-full border border-white/10 bg-black/35 px-5 py-4 text-base text-[#F0EDE6] outline-none placeholder:text-white/25 focus:border-[#E04020]/45"
        />
        <button
          type="submit"
          disabled={isBusy}
          className="shimmer-button relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#E04020]/45 bg-[#E04020] px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-[#080808] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          <span className="relative z-10">
            {isBusy ? "Holding your ground..." : "Fire Back →"}
          </span>
        </button>
      </form>
    </div>
  );
}
