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
    <div className="surface-card rounded-[28px] p-5 backdrop-blur">
      <div className="space-y-2">
        <p className="font-mono text-xs tracking-[0.22em] text-[#2f6e78]">
          Defend Yourself
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#1f2933] [font-family:var(--font-display)]">
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
          className="flex-1 rounded-full border border-[#1f2933]/15 bg-white/80 px-5 py-4 text-base text-[#1f2933] outline-none placeholder:text-[#8a95a3] focus:border-[#2f6e78]/45"
        />
        <button
          type="submit"
          disabled={isBusy}
          className="primary-btn shimmer-button relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-4 text-sm font-semibold tracking-[0.14em] transition disabled:opacity-60"
        >
          <span className="relative z-10">
            {isBusy ? "Holding your ground..." : "Fire Back →"}
          </span>
        </button>
      </form>
    </div>
  );
}
