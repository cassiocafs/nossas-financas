import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getTheme, setTheme, type Theme } from "@/lib/theme";

const opcoes: { valor: Theme; label: string; Icon: typeof Sun }[] = [
  { valor: "light", label: "Claro", Icon: Sun },
  { valor: "dark", label: "Escuro", Icon: Moon },
  { valor: "system", label: "Sistema", Icon: Monitor },
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
          <Monitor className="size-4" />
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
