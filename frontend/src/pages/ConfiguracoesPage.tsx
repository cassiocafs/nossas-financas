import { ChevronLeft } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";

export function ConfiguracoesPage() {
  const location = useLocation();
  const emSubtela = location.pathname !== "/configuracoes";

  return (
    <div className="space-y-8 pt-4 sm:pt-6 lg:pt-8">
      <div className="space-y-2">
        {emSubtela && (
          <Link
            to="/configuracoes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Voltar
          </Link>
        )}
        <h1 className="text-3xl font-semibold text-foreground">Configurações</h1>
      </div>

      <Outlet />
    </div>
  );
}
