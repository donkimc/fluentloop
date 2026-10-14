import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/join");
  }

  const consentedAt = (session.user as { consentedAt?: Date | string | null }).consentedAt;
  if (consentedAt) {
    redirect("/");
  }

  const suggestedName =
    (session.user as { displayName?: string | null }).displayName?.trim() ||
    session.user.name?.trim() ||
    "";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <p className="mb-6 text-sm font-semibold tracking-wide text-primary uppercase">SpeakGround</p>
      <OnboardingForm suggestedName={suggestedName} />
    </main>
  );
}
