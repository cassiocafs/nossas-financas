-- Índices para chaves estrangeiras sem índice de cobertura (linter do Supabase).
-- Tabelas pequenas: criação instantânea.

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MembroEspaco_espacoId_idx" ON "MembroEspaco"("espacoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Convite_criadoPorId_idx" ON "Convite"("criadoPorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SubgrupoCategoria_espacoId_idx" ON "SubgrupoCategoria"("espacoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SerieRecorrencia_espacoId_idx" ON "SerieRecorrencia"("espacoId");
