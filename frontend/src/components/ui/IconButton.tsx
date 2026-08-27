import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "soft" | "ghost" | "solid";
type Size = "sm" | "md";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: Variant;
  size?: Size;
}

const sizes: Record<Size, string> = {
  sm: "size-8",
  md: "size-10",
};

const variants: Record<Variant, string> = {
  soft: "bg-accent text-accent-foreground hover:brightness-95",
  ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  solid: "bg-primary text-primary-foreground hover:bg-primary/90",
};

/** Botão apenas com ícone. `label` é obrigatório (usado como aria-label e title). */
export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid shrink-0 place-items-center rounded-full transition-colors ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
