import type { ComponentProps } from "react";

import { cn } from "./cn";

/**
 * Korean explanation shown under the English it explains. Always secondary
 * (smaller, muted) so English stays the focus. Hidden when the learner turns
 * the "show Korean" toggle off.
 */
export function KoreanHint({ className, ...props }: ComponentProps<"p">) {
  return (
    <p lang="ko" className={cn("text-sm leading-relaxed text-korean", className)} {...props} />
  );
}
