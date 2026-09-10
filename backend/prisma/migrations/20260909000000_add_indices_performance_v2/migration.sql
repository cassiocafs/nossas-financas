-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transacao_espacoId_contaId_data_idx" ON "Transacao"("espacoId", "contaId", "data");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrcamentoCategoriaMes_categoriaId_idx" ON "OrcamentoCategoriaMes"("categoriaId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Categoria_grupoId_idx" ON "Categoria"("grupoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Categoria_subgrupoId_idx" ON "Categoria"("subgrupoId");
