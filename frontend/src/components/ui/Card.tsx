import type { HTMLAttributes } from "react";

type Tone = "default" | "cream" | "brand" | "soft";

export const cardClassName = "card-surface";

const tones: Record<Tone, string> = {
  default: "card-surface",
  cream: "rounded-lg bg-secondary text-secondary-foreground",
  brand: "rounded-lg bg-primary text-primary-foreground shadow-lift",
  soft: "rounded-lg bg-accent text-accent-foreground",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
}

export function Card({ tone = "default", className = "", ...props }: CardProps) {
  return <div className={`${tones[tone]} ${className}`} {...props} />;
}
