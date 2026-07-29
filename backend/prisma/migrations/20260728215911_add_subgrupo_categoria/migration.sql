-- DropIndex
DROP INDEX "Categoria_espacoId_grupoId_nome_key";

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "subgrupoId" TEXT;

-- CreateTable
CREATE TABLE "SubgrupoCategoria" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubgrupoCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubgrupoCategoria_grupoId_nome_key" ON "SubgrupoCategoria"("grupoId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_espacoId_grupoId_subgrupoId_nome_key" ON "Categoria"("espacoId", "grupoId", "subgrupoId", "nome");

-- AddForeignKey
ALTER TABLE "SubgrupoCategoria" ADD CONSTRAINT "SubgrupoCategoria_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubgrupoCategoria" ADD CONSTRAINT "SubgrupoCategoria_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoCategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_subgrupoId_fkey" FOREIGN KEY ("subgrupoId") REFERENCES "SubgrupoCategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- EnableRLS
ALTER TABLE "SubgrupoCategoria" ENABLE ROW LEVEL SECURITY;

