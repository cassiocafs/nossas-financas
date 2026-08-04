import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "./Navbar";

export function AppShell() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono text-sm text-ink/60 dark:text-paper/60">
        Carregando...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink dark:bg-paper-night dark:text-paper">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
