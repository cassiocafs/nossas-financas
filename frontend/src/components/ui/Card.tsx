import type { HTMLAttributes } from "react";

export const cardClassName = "card-surface";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${cardClassName} ${className}`} {...props} />;
}
