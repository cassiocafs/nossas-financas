import { useState } from "react";
import type { SVGProps } from "react";
import { Card } from "@/components/ui/Card";
import { getTheme, setTheme, type Theme } from "@/lib/theme";

type IconProps = SVGProps<SVGSVGElement>;

function IconSun(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function IconMonitor(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

const opcoes: { valor: Theme; label: string; Icon: typeof IconSun }[] = [
  { valor: "light", label: "Claro", Icon: IconSun },
  { valor: "dark", label: "Escuro", Icon: IconMoon },
  { valor: "system", label: "Sistema", Icon: IconMonitor },
];

export function ThemeCard() {
  const [theme, setThemeState] = useState<Theme>(() => getTheme());

  function selecionar(valor: Theme) {
    setTheme(valor);
    setThemeState(valor);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-accent text-accent-foreground">
          <IconMonitor className="size-4" />
        </span>
        <h3 className="font-display text-sm font-bold text-foreground">Aparência</h3>
      </div>
      <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground">
        Escolha entre tema claro, escuro ou o mesmo definido no seu dispositivo.
      </p>
      <div className="mt-4 flex w-fit gap-1 rounded-[11px] border border-border bg-muted/50 p-1">
        {opcoes.map(({ valor, label, Icon }) => (
          <button
            key={valor}
            type="button"
            onClick={() => selecionar(valor)}
            className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors ${
              theme === valor
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    </Card>
  );
}
