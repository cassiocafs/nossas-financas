import { NavLink, Outlet } from "react-router";

const tabs = [
  { to: "contas", label: "Configurar Contas" },
  { to: "categorias", label: "Configurar categorias" },
  { to: "importacao", label: "Importação" },
];

export function ConfiguracoesPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold text-ink dark:text-paper">
        Configurações
      </h1>

      <nav className="flex gap-1 border-b border-line dark:border-line-night">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `border-b-2 px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors ${
                isActive
                  ? "border-marca text-ink dark:text-paper"
                  : "border-transparent text-ink/50 hover:text-ink dark:text-paper/50 dark:hover:text-paper"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
