-- CreateTable
CREATE TABLE IF NOT EXISTS "Meta" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "emoji" TEXT,
    "valorAlvo" DECIMAL(14,2) NOT NULL,
    "dataAlvo" DATE,
    "concluidaEm" TIMESTAMP(3),
    "arquivada" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AporteMeta" (
    "id" TEXT NOT NULL,
    "metaId" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "data" DATE NOT NULL,
    "nota" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AporteMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Meta_espacoId_idx" ON "Meta"("espacoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AporteMeta_metaId_idx" ON "AporteMeta"("metaId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AporteMeta_espacoId_idx" ON "AporteMeta"("espacoId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "Meta" ADD CONSTRAINT "Meta_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "AporteMeta" ADD CONSTRAINT "AporteMeta_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "Meta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- EnableRLS
ALTER TABLE "Meta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AporteMeta" ENABLE ROW LEVEL SECURITY;
