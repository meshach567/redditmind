import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950">
      <div className="flex-1 w-full flex flex-col gap-16 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 fixed top-0 bg-background/90 backdrop-blur-md z-20">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="text-sm font-semibold tracking-tight">
                Redditmind
              </Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <div className="flex-1 flex w-full justify-center pt-20 pb-10 px-4">
          <div className="relative w-full max-w-5xl">
            <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
              <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
            </div>

            <div className="relative rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-xl shadow-black/30 md:p-8">
              {children}
            </div>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t border-slate-800/80 mx-auto text-center text-xs gap-4 py-6 text-slate-400">
          <p className="flex items-center gap-1">
            <span className="text-slate-500">Built with</span>
            <Link
              href="https://nextjs.org"
              target="_blank"
              className="font-medium text-slate-200 hover:underline"
              rel="noreferrer"
            >
              Next.js
            </Link>
            <span className="text-slate-500">and</span>
            <Link
              href="https://supabase.com"
              target="_blank"
              className="font-medium text-slate-200 hover:underline"
              rel="noreferrer"
            >
              Supabase
            </Link>
          </p>
          <span className="h-4 w-px bg-slate-700" />
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
