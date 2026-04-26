export default function Loading() {
  return (
    <main className="min-h-screen px-6 py-10 text-[#1f2933]">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="space-y-4">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[#dbe3ea]" />
          <div className="h-24 w-full max-w-3xl animate-pulse rounded-3xl bg-[#e8edf2]" />
          <div className="h-6 w-full max-w-xl animate-pulse rounded-full bg-[#e8edf2]" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl border border-[#1f2933]/12 bg-[#fafcfd]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
