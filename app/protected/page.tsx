import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PersonasSection from "@/components/dashboard/personas-section";
import KeywordsSection from "@/components/dashboard/keywords-section";
import CalendarSection from "@/components/dashboard/calendar-section";

async function UserDetails() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user.email;
}

export default async function DashboardPage() {
  await UserDetails();

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Reddit Mastermind</h1>
        <p className="text-gray-600">
          AI-powered Reddit content calendar platform
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-8">
        {/* Personas Tab */}
        <section className="space-y-6 border-t pt-8">
          <PersonasSection />
        </section>

        {/* Keywords Tab */}
        <section className="space-y-6 border-t pt-8">
          <KeywordsSection />
        </section>

        {/* Calendar Tab */}
        <section className="space-y-6 border-t pt-8">
          <CalendarSection />
        </section>
      </div>
    </div>
  );
}
