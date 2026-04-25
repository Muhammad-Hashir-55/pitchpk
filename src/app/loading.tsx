export default function Loading() {
  return (
    <main className="min-h-screen bg-[#080808] px-6 py-10 text-[#F0EDE6]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="space-y-4">
          <div className="h-4 w-40 rounded-full bg-white/10" />
          <div className="h-24 w-full max-w-3xl rounded-3xl bg-white/8" />
          <div className="h-6 w-full max-w-xl rounded-full bg-white/8" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-72 rounded-3xl border border-white/10 bg-[#111111]/80"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
