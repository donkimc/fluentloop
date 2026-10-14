import { redirect } from "next/navigation";

import { isKakaoConfigured, loadWebEnv } from "@/lib/env";
import { getSession } from "@/lib/session";

import { JoinForm } from "./join-form";

export const dynamic = "force-dynamic";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  let session: Awaited<ReturnType<typeof getSession>> = null;
  try {
    session = await getSession();
  } catch {
    session = null;
  }
  if (session?.user) {
    const consentedAt = (session.user as { consentedAt?: Date | string | null }).consentedAt;
    redirect(consentedAt ? "/" : "/onboarding");
  }

  const params = await searchParams;
  let kakaoEnabled = false;
  try {
    kakaoEnabled = isKakaoConfigured(loadWebEnv());
  } catch {
    kakaoEnabled = false;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <p className="mb-6 text-sm font-semibold tracking-wide text-primary uppercase">SpeakGround</p>
      <JoinForm initialCode={params.code?.trim() ?? ""} kakaoEnabled={kakaoEnabled} />
    </main>
  );
}
