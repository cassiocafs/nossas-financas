import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import type { SVGProps } from "react";
import { listarContas } from "@/api/contas";
import { listarGrupos } from "@/api/categorias";
import { listarRegras } from "@/api/regras";
import { Card } from "@/components/ui/Card";
import { ThemeCard } from "@/components/configuracoes/ThemeCard";

type IconProps = SVGProps<SVGSVGElement>;

function IconWallet(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 8a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm13 4h3" />
    </svg>
  );
}

function IconTag(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12 12 3h6a3 3 0 0 1 3 3v6l-9 9-9-9Zm12-4h.01" />
    </svg>
  );
}

function IconRules(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h10M4 12h16M4 17h7M18 5v4M18 15v4" />
    </svg>
  );
}

function IconUpload(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 16V4m-5 5 5-5 5 5M4 18v2h16v-2" />
    </svg>
  );
}

export function ConfiguracoesOverview() {
  const { data: contas } = useQuery({
    queryKey: ["contas", "ativas"],
    queryFn: () => listarContas(false),
  });
  const { data: grupos } = useQuery({ queryKey: ["categorias", "grupos"], queryFn: listarGrupos });
  const { data: regras } = useQuery({ queryKey: ["regras"], queryFn: listarRegras });

  const totalCategorias = grupos
    ? grupos.grupos.reduce(
        (soma, g) =>
          soma + g.categorias.length + g.subgrupos.reduce((s, sg) => s + sg.categorias.length, 0),
        0,
      ) + grupos.semGrupo.length
    : 0;

  const cards = [
    {
      to: "contas",
      titulo: "Contas",
      meta: contas ? `${contas.length} ativas` : "—",
      desc: "Cadastre contas correntes, cartões e reservas. O saldo de cada conta alimenta o patrimônio total.",
      acao: "Gerenciar contas",
      Icon: IconWallet,
    },
    {
      to: "categorias",
      titulo: "Categorias",
      meta: grupos ? `${totalCategorias} em ${grupos.grupos.length} grupos` : "—",
      desc: "Organize categorias em grupos e subgrupos para relatórios e orçamento consistentes.",
      acao: "Gerenciar categorias",
      Icon: IconTag,
    },
    {
      to: "regras",
      titulo: "Regras de inserção",
      meta: regras ? `${regras.length} regras` : "—",
      desc: "Categorize automaticamente lançamentos recorrentes a partir da descrição do extrato.",
      acao: "Ver regras",
      Icon: IconRules,
    },
    {
      to: "importacao",
      titulo: "Importação de extrato",
      meta: "Arquivos do banco",
      desc: "Importe arquivos do banco, revise duplicidades e confirme a categorização sugerida.",
      acao: "Importar extrato",
      Icon: IconUpload,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map(({ to, titulo, meta, desc, acao, Icon }) => (
        <Card key={to} className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-accent text-accent-foreground">
                <Icon className="size-4" />
              </span>
              <h3 className="font-display text-sm font-bold text-foreground">{titulo}</h3>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>
          </div>
          <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
          <Link
            to={to}
            className="mt-4 inline-flex rounded-[10px] border border-border px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {acao}
          </Link>
        </Card>
      ))}
      <ThemeCard />
    </div>
  );
}
