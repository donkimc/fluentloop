"use client";

import { Button, Input, KoreanHint, Label } from "@fluentloop/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function OnboardingForm({ suggestedName }: { suggestedName: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(suggestedName);
  const [showKorean, setShowKorean] = useState(true);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          consent,
          showKorean,
          leaderboardOptIn,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not save your profile.");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Almost ready</h1>
        <p className="text-muted-foreground">
          Pick a display name and accept the beta terms. You can change Korean hints later.
        </p>
        <KoreanHint>표시 이름과 베타 이용 동의가 필요합니다.</KoreanHint>
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          required
          minLength={2}
          maxLength={40}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="nickname"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Preferences</legend>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={showKorean}
            onChange={(event) => setShowKorean(event.target.checked)}
          />
          <span>
            Show Korean explanations by default
            <KoreanHint>한국어 설명을 기본으로 표시</KoreanHint>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={leaderboardOptIn}
            onChange={(event) => setLeaderboardOptIn(event.target.checked)}
          />
          <span>
            Show me on the weekly days-completed leaderboard
            <KoreanHint>주간 출석 리더보드에 이름 표시 (선택)</KoreanHint>
          </span>
        </label>
      </fieldset>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-primary"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          required
        />
        <span>
          I am an adult and agree that SpeakGround may store my learning data to improve the beta.
          Hosting and AI processing may happen outside Korea (Singapore / LLM vendors). Voice
          recordings stay on my device.
          <KoreanHint>
            성인이며, 베타 개선을 위한 학습 데이터 저장과 해외 처리(싱가포르·LLM)에 동의합니다.
            녹음은 기기에만 남습니다.
          </KoreanHint>
        </span>
      </label>

      <Button type="submit" className="w-full" disabled={pending || !consent}>
        {pending ? "Saving…" : "Start learning"}
      </Button>
    </form>
  );
}
