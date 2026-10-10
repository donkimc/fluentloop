import { Button, KoreanHint } from "@fluentloop/ui";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">FluentLoop</p>
        <h1 className="text-3xl font-bold tracking-tight">Your daily English, at your level.</h1>
        <p className="text-muted-foreground">
          Five to ten minutes a day, built around this week&apos;s meetup topic.
        </p>
        <KoreanHint>매일 5~10분, 내 수준에 맞춘 영어 학습.</KoreanHint>
      </div>
      <Button disabled>Coming soon</Button>
    </main>
  );
}
