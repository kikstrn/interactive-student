import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KlikaoLogo from "@/components/brand/klikao-logo";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
            first_name,
            onboarding_completed
        `
    )
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed === true) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto mb-8 flex max-w-4xl justify-center">
        <KlikaoLogo href="/" priority className="h-20 sm:h-24" />
      </div>

      <div className="mx-auto flex max-w-5xl justify-center">
        <OnboardingForm firstName={profile?.first_name} />
      </div>
    </main>
  );
}
