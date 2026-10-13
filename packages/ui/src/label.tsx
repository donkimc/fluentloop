import type { ComponentProps } from "react";

import { cn } from "./cn";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground peer-disabled:opacity-50", className)}
      {...props}
    />
  );
}
