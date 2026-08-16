-- CreateTable
CREATE TABLE "RegraTransacao" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "descricaoNormalizada" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegraTransacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegraTransacao_contaId_idx" ON "RegraTransacao"("contaId");

-- CreateIndex
CREATE INDEX "RegraTransacao_categoriaId_idx" ON "RegraTransacao"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "RegraTransacao_espacoId_descricaoNormalizada_key" ON "RegraTransacao"("espacoId", "descricaoNormalizada");

-- AddForeignKey
ALTER TABLE "RegraTransacao" ADD CONSTRAINT "RegraTransacao_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegraTransacao" ADD CONSTRAINT "RegraTransacao_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegraTransacao" ADD CONSTRAINT "RegraTransacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- EnableRLS
ALTER TABLE "RegraTransacao" ENABLE ROW LEVEL SECURITY;
