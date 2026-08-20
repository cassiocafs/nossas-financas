import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { AppShell } from "@/components/layout/AppShell";

const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() =>
  import("@/pages/SignupPage").then((m) => ({ default: m.SignupPage })),
);
const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const TransacoesPage = lazy(() =>
  import("@/pages/TransacoesPage").then((m) => ({ default: m.TransacoesPage })),
);
const OrcamentoPage = lazy(() =>
  import("@/pages/OrcamentoPage").then((m) => ({ default: m.OrcamentoPage })),
);
const ConfiguracoesPage = lazy(() =>
  import("@/pages/ConfiguracoesPage").then((m) => ({ default: m.ConfiguracoesPage })),
);
const ContasSection = lazy(() =>
  import("@/components/contas/ContasSection").then((m) => ({ default: m.ContasSection })),
);
const CategoriasSection = lazy(() =>
  import("@/components/categorias/CategoriasSection").then((m) => ({
    default: m.CategoriasSection,
  })),
);
const RegrasSection = lazy(() =>
  import("@/components/regras/RegrasSection").then((m) => ({ default: m.RegrasSection })),
);
const ImportarExtratoSection = lazy(() =>
  import("@/components/importacao/ImportarExtratoSection").then((m) => ({
    default: m.ImportarExtratoSection,
  })),
);
const ConfiguracoesOverview = lazy(() =>
  import("@/components/configuracoes/ConfiguracoesOverview").then((m) => ({
    default: m.ConfiguracoesOverview,
  })),
);

function CarregandoRota() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground/60">
      Carregando...
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<CarregandoRota />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/transacoes" element={<TransacoesPage />} />
          <Route path="/orcamento" element={<OrcamentoPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />}>
            <Route index element={<ConfiguracoesOverview />} />
            <Route path="contas" element={<ContasSection />} />
            <Route path="categorias" element={<CategoriasSection />} />
            <Route path="regras" element={<RegrasSection />} />
            <Route path="importacao" element={<ImportarExtratoSection />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
