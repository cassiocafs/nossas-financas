import { NavLink, Outlet } from "react-router";

const tabs = [
  { to: "contas", label: "Configurar Contas" },
  { to: "categorias", label: "Configurar categorias" },
  { to: "regras", label: "Regras de inserção" },
  { to: "importacao", label: "Importação" },
];

export function ConfiguracoesPage() {
  return (
    <div className="space-y-8 pt-4 sm:pt-6 lg:pt-8">
      <h1 className="text-3xl font-semibold text-foreground">Configurações</h1>

      <nav className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `border-b-2 px-3 py-2 text-xs tracking-wide uppercase transition-colors ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
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
