import Link from "next/link";

export function Hero() {
  return (
    <section className="w-full max-w-5xl mx-auto pt-28 pb-10 px-5">
      <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-left shadow-xl">
        {/* Glow accents */}
        <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
          <div className="absolute -top-24 -left-10 h-72 w-72 rounded-full bg-purple-500/40 blur-3xl" />
          <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-sky-500/40 blur-3xl" />
        </div>

        <div className="relative grid gap-10 p-8 md:grid-cols-[1.4fr,1fr] md:p-12">
          {/* Copy */}
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-sky-300 ring-1 ring-sky-500/40">
              Redditmind · AI content orchestration
            </span>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-5xl">
                Plan realistic Reddit conversations,
                <span className="block text-sky-300">not spammy threads.</span>
              </h1>
              <p className="max-w-xl text-sm text-slate-300 md:text-base">
                Redditmind designs weekly Reddit content calendars that use multiple personas,
                natural comment arcs, and smart scheduling to earn trust, upvotes, and long‑term
                SEO visibility—without manual spreadsheet gymnastics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300/80 md:text-sm">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Runs on Next.js, Supabase & TypeScript
              </div>
              <span className="hidden h-4 w-px bg-slate-700 md:inline-block" />
              <p>Safe planning only — you stay in control of posting and moderation.</p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-slate-700/80">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Planner Highlights
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Intent‑aware topics: comparisons, recommendations, how‑tos, and problems.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
                  <span>Anti‑astroturfing persona rules to avoid obvious self‑promotion.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Quality‑scored calendars ready to review with your team or clients.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/60 p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-200">How to get started</p>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Create 2–5 realistic Reddit personas with their home subreddits.</li>
                <li>Add high‑intent keywords grouped by comparison, recommendation, and how‑to.</li>
                <li>
                  Hit <span className="font-semibold text-sky-300">“Generate This Week”</span> to see a full
                  calendar of posts & comments.
                </li>
              </ol>
              <p className="mt-2">
                Need help?{" "}
                <Link
                  href="mailto:founder@redditmind.ai"
                  className="font-medium text-sky-300 underline-offset-2 hover:underline"
                >
                  Say hi and share your use case.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
