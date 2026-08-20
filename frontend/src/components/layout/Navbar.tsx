import { NavLink } from "react-router";
import type { SVGProps } from "react";
import { useAuth } from "@/contexts/AuthContext";

type IconProps = SVGProps<SVGSVGElement>;

function IconHome(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function IconSwap(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h13l-3-3" />
      <path d="M20 17H7l3 3" />
    </svg>
  );
}

function IconChart(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z" />
    </svg>
  );
}

function IconGear(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.04 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10.5a1.7 1.7 0 0 0 1.04-1.56V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10.5a1.7 1.7 0 0 0 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z" />
    </svg>
  );
}

function IconLogout(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

const links = [
  { to: "/", label: "Início", icon: IconHome },
  { to: "/transacoes", label: "Transações", icon: IconSwap },
  { to: "/orcamento", label: "Orçamento", icon: IconChart },
  { to: "/configuracoes", label: "Configurações", icon: IconGear },
];

export function Navbar() {
  const { session, signOut } = useAuth();
  const email = session?.user.email ?? "";

  return (
    <header className="sticky top-0 z-40 flex shrink-0 flex-col gap-3 border-b border-border bg-card/70 px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-5 sm:px-6">
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-income text-sm font-bold text-white">
          N
        </span>
        <p className="font-display text-base leading-tight font-bold text-foreground">
          Nossas Finanças
        </p>
      </div>

      <nav className="flex flex-1 gap-1 overflow-x-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2.5 rounded-[11px] px-3 py-2 text-sm font-semibold transition-colors ${
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
          className="shrink-0 rounded-[9px] p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <IconLogout className="size-4" />
        </button>
      </div>
    </header>
  );
}
