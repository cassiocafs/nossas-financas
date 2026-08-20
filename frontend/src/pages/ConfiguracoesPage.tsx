import { Outlet } from "react-router";

export function ConfiguracoesPage() {
  return (
    <div className="space-y-8 pt-4 sm:pt-6 lg:pt-8">
      <h1 className="text-3xl font-semibold text-foreground">Configurações</h1>

      <Outlet />
    </div>
  );
}
