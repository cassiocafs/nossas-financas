-- Habilita Row Level Security em todas as tabelas da aplicação.
-- O backend acessa o banco via DATABASE_URL com a role "postgres", que ignora RLS,
-- então isso não afeta a API Express. O objetivo é impedir que a API REST/GraphQL
-- automática do Supabase (usada com a anon key) leia ou grave nessas tabelas,
-- já que toda a lógica de autorização vive no backend.

ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EspacoFinanceiro" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MembroEspaco" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Convite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GrupoCategoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Categoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RegraCategorizacao" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SerieRecorrencia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transacao" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrcamentoAnual" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrcamentoCategoriaMes" ENABLE ROW LEVEL SECURITY;
