"use client";

import { Button, KoreanHint, Label, Textarea } from "@fluentloop/ui";
import { type FormEvent, useState } from "react";

import type { PlacementView } from "@/lib/placement";

const SKILL_KO: Record<string, string> = {
  grammar: "문법",
  vocabulary: "어휘",
  reading: "읽기",
  listening: "듣기",
  writing: "쓰기",
};

export function PlacementTest({ initial }: { initial: PlacementView }) {
  const [view, setView] = useState(initial);
  const [choice, setChoice] = useState<number | null>(null);
  const [writing, setWriting] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const item = view.item;

  async function post(url: string, body?: unknown) {
    setError(null);
    setPending(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await response.json()) as PlacementView & { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setView(data);
      setChoice(null);
      setWriting("");
      setShowScript(false);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  function play(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setShowScript(true);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  if (view.results) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Your level</h1>
          <p className="text-muted-foreground">
            This is a first estimate. Daily practice will adjust it.
          </p>
          <KoreanHint>첫 실력 추정이에요. 매일 연습하면서 더 정확해집니다.</KoreanHint>
        </div>
        <ul className="space-y-3">
          {view.results.map((result) => (
            <li key={result.skill} className="rounded-lg border border-border bg-card px-4 py-3">
              <p>{result.sentence}</p>
              <KoreanHint>
                {SKILL_KO[result.skill]}: {result.band} 정도예요.
              </KoreanHint>
            </li>
          ))}
        </ul>
        {view.retakeOn ? (
          <p className="text-sm text-muted-foreground">You can retake this on {view.retakeOn}.</p>
        ) : null}
        {view.canRetake ? (
          <Button type="button" disabled={pending} onClick={() => post("/api/placement/retake")}>
            Retake the test
          </Button>
        ) : null}
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  if (!item) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!item) return;
    if (item.skill === "writing") {
      void post("/api/placement", { itemId: item.id, writing });
      return;
    }
    if (choice === null) {
      setError("Choose one option.");
      return;
    }
    void post("/api/placement", { itemId: item.id, choiceIndex: choice });
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">
          {item.skill[0]?.toUpperCase()}
          {item.skill.slice(1)} · {view.progress.done + 1} of {view.progress.total}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Placement test</h1>
        <KoreanHint>
          약 15분이에요. B1에서 시작해서 맞히면 어려워지고, 틀리면 쉬워집니다.
        </KoreanHint>
      </div>

      {item.passage ? (
        <p className="rounded-lg border border-border bg-card px-4 py-3 leading-relaxed">
          {item.passage}
        </p>
      ) : null}

      {item.listenText ? (
        <div className="space-y-2">
          <Button type="button" variant="secondary" onClick={() => play(item.listenText ?? "")}>
            Play
          </Button>
          {showScript ? <p className="text-sm leading-relaxed">{item.listenText}</p> : null}
          <KoreanHint>재생을 누른 뒤 문제를 푸세요. 소리가 없으면 문장이 나타납니다.</KoreanHint>
        </div>
      ) : null}

      <p className="text-lg leading-relaxed">{item.prompt}</p>
      <KoreanHint>{item.koreanHint}</KoreanHint>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {item.options ? (
        <fieldset className="space-y-2">
          <legend className="sr-only">Answer</legend>
          {item.options.map((option, index) => (
            <label
              key={`${item.id}-${index}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
            >
              <input
                type="radio"
                name="choice"
                className="size-4 accent-primary"
                checked={choice === index}
                onChange={() => setChoice(index)}
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="writing">Your answer</Label>
          <Textarea
            id="writing"
            name="writing"
            required
            maxLength={2000}
            value={writing}
            onChange={(event) => setWriting(event.target.value)}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        Continue
      </Button>
    </form>
  );
}
