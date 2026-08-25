import { House, ArrowLeftRight, ChartPie, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import logoHorizontal from "@/assets/brand/logo-horizontal.png";

const links = [
  { to: "/", label: "Início", icon: House },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/orcamento", label: "Orçamento", icon: ChartPie },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Navbar() {
  const { session, signOut } = useAuth();
  const email = session?.user.email ?? "";

  return (
    <header className="sticky top-0 z-40 flex shrink-0 flex-col gap-3 border-b border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
      <div className="flex shrink-0 items-center">
        <img src={logoHorizontal} alt="Poupeu" className="h-7 w-auto" />
      </div>

      <nav className="flex flex-1 gap-1 overflow-x-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon className="size-[17px] shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2.5 border-t border-border pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
          {email ? email.charAt(0).toUpperCase() : "?"}
        </span>
        <span className="min-w-0 max-w-[10rem] truncate text-xs text-muted-foreground">
          {email}
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          aria-label="Sair"
          title="Sair"
          className="shrink-0 rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
