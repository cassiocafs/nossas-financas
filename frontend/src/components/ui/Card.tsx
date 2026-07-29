import type { HTMLAttributes } from "react";

export const cardClassName =
  "rounded-lg border border-line bg-surface shadow-sm dark:border-line-night dark:bg-surface-night";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${cardClassName} ${className}`} {...props} />;
}
