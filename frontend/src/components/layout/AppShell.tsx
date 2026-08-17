import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "./Navbar";

export function AppShell() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-foreground/60">
        Carregando...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
