import { User } from "lucide-react";

interface AvatarProps {
  name?: string | null;
  size?: number;
  className?: string;
}

/** Avatar circular com as iniciais do nome/e-mail, ou um ícone genérico quando não há nome. */
export function Avatar({ name, size = 40, className = "" }: AvatarProps) {
  const inicial = name?.trim()?.charAt(0)?.toUpperCase();

  return (
    <span
      style={{ width: size, height: size }}
      className={`grid shrink-0 place-items-center rounded-full bg-accent text-accent-foreground ${className}`}
    >
      {inicial ? (
        <span className="text-sm font-bold">{inicial}</span>
      ) : (
        <User className="size-[45%]" aria-hidden="true" />
      )}
    </span>
  );
}
