import { redirect } from "next/navigation";

import { loadPlacement } from "@/lib/placement";
import { getSession } from "@/lib/session";

import { PlacementTest } from "./placement-test";

export const dynamic = "force-dynamic";

export default async function PlacementPage() {
  const session = await getSession();
  if (!session?.user) redirect("/join");

  const consentedAt = (session.user as { consentedAt?: Date | string | null }).consentedAt;
  if (!consentedAt) redirect("/onboarding");

  const view = await loadPlacement(session.user.id);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <p className="mb-6 text-sm font-semibold tracking-wide text-primary uppercase">SpeakGround</p>
      <PlacementTest initial={view} />
    </main>
  );
}
