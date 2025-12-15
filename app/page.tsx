import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Hero } from "@/components/hero";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-16 items-center">
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
        <Hero />

        {/* Primary CTA under hero for clarity */}
        <div className="flex justify-center pb-10">
          <Suspense>
            <AuthButton />
          </Suspense>
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
