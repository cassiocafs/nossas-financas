import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { HomePage } from "@/pages/HomePage";
import { TransacoesPage } from "@/pages/TransacoesPage";
import { OrcamentoPage } from "@/pages/OrcamentoPage";
import { ConfiguracoesPage } from "@/pages/ConfiguracoesPage";
import { ContasSection } from "@/components/contas/ContasSection";
import { CategoriasSection } from "@/components/categorias/CategoriasSection";
import { ImportarExtratoSection } from "@/components/importacao/ImportarExtratoSection";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/transacoes" element={<TransacoesPage />} />
        <Route path="/orcamento" element={<OrcamentoPage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />}>
          <Route index element={<Navigate to="contas" replace />} />
          <Route path="contas" element={<ContasSection />} />
          <Route path="categorias" element={<CategoriasSection />} />
          <Route path="importacao" element={<ImportarExtratoSection />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
