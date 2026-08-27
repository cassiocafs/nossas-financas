import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

export function SearchInput({ className = "", ...props }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        className="h-9 w-full rounded-full border border-border bg-muted pr-3 pl-8 text-[13px] text-foreground placeholder:text-muted-foreground focus:bg-card"
        {...props}
      />
    </div>
  );
}
