import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "accent" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[13px]",
  md: "h-12 px-6 text-[14px]",
  lg: "h-14 px-7 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary: "border-0 bg-primary text-primary-foreground font-bold hover:bg-primary/90",
  secondary: "border-0 bg-secondary text-secondary-foreground font-bold hover:brightness-95",
  ghost: "border border-border bg-transparent text-primary hover:bg-accent",
  outline: "border border-border bg-transparent text-primary hover:bg-accent",
  accent: "border-0 bg-yellow-accent text-primary font-bold hover:brightness-95",
  destructive: "border-0 bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
