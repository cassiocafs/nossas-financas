import { useState, type MouseEvent } from "react";
import { Bell } from "lucide-react";
import { NavLink } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { ContextMenu } from "@/components/ui/ContextMenu";
import logoHorizontal from "@/assets/brand/logo-horizontal.png";

const links = [
  { to: "/", label: "Início" },
  { to: "/transacoes", label: "Transações" },
  { to: "/orcamento", label: "Orçamento" },
  { to: "/metas", label: "Metas" },
  { to: "/relatorios", label: "Relatórios" },
  { to: "/configuracoes", label: "Configurações" },
];

export function TopBar() {
  const { session, signOut } = useAuth();
  const email = session?.user.email ?? "";
  const nome = (session?.user.user_metadata as { nome?: string } | undefined)?.nome;

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  function abrirMenuUsuario(e: MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.right - 150, y: rect.bottom + 6 });
  }

  return (
    <header className="relative z-30 flex h-[72px] shrink-0 items-center gap-8 border-b border-border bg-card px-7">
      <img src={logoHorizontal} alt="Poupeu" style={{ width: 126 }} className="h-auto shrink-0" />

      <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex h-10 shrink-0 items-center rounded-full px-3.5 text-[15px] transition-colors ${
                isActive
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <IconButton icon={<Bell className="size-4" />} label="Notificações" variant="soft" />

      <button type="button" onClick={abrirMenuUsuario} className="shrink-0 rounded-full">
        <Avatar name={nome ?? email} />
      </button>

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setMenuPos(null)}
          items={[{ label: "Sair", onClick: () => signOut(), danger: true }]}
        />
      )}
    </header>
  );
}
