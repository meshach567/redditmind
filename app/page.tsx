import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* Navigation */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 fixed top-0 bg-background/95 backdrop-blur-md z-10">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/" className="text-lg font-bold">
                Reddit Mastermind
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5 items-center text-center">
          <div className="flex flex-col gap-6 py-10">
            <h1 className="text-5xl font-bold">Reddit Mastermind</h1>
            <p className="text-xl text-foreground/80">
              AI-Powered Reddit Content Calendar Platform
            </p>
            <p className="text-lg text-foreground/60 max-w-2xl">
              Automate high-quality Reddit content planning with intelligent algorithms.
              Generate engaging posts and comment threads across multiple personas.
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full py-10">
            <div className="flex flex-col gap-3 p-6 rounded-lg border border-foreground/10 hover:border-foreground/20 transition">
              <h3 className="font-semibold text-lg">📝 Persona Management</h3>
              <p className="text-foreground/70 text-sm">
                Create and manage multiple Reddit personas with realistic posting patterns
              </p>
            </div>
            <div className="flex flex-col gap-3 p-6 rounded-lg border border-foreground/10 hover:border-foreground/20 transition">
              <h3 className="font-semibold text-lg">🔑 Keyword Planning</h3>
              <p className="text-foreground/70 text-sm">
                Organize keywords by intent and automatically generate diverse content topics
              </p>
            </div>
            <div className="flex flex-col gap-3 p-6 rounded-lg border border-foreground/10 hover:border-foreground/20 transition">
              <h3 className="font-semibold text-lg">📅 Content Calendar</h3>
              <p className="text-foreground/70 text-sm">
                Generate weekly Reddit content calendars with posts and comment threads
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built with{" "}
            <Link
              href="https://nextjs.org"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Next.js, TypeScript
            </Link>
            {" and "}
            <Link
              href="https://supabase.com"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
