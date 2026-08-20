import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "rounded-[11px] px-[18px] py-[11px] text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "border-0 bg-primary text-primary-foreground font-bold hover:opacity-90",
  ghost: "border border-border bg-transparent text-foreground font-semibold hover:bg-muted",
  danger: "border-0 bg-destructive text-destructive-foreground font-bold hover:opacity-90",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
