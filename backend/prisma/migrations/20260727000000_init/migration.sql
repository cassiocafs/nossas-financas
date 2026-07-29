-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PapelMembro" AS ENUM ('PROPRIETARIO', 'EDITOR', 'LEITOR');

-- CreateEnum
CREATE TYPE "StatusConvite" AS ENUM ('PENDENTE', 'ACEITO', 'CANCELADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('DESPESA', 'RECEITA', 'AMBOS');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('DESPESA', 'RECEITA', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "TipoSerie" AS ENUM ('PARCELAMENTO_MENSAL', 'AVANCADO');

-- CreateEnum
CREATE TYPE "FrequenciaUnidade" AS ENUM ('DIA', 'SEMANA', 'MES', 'ANO');

-- CreateEnum
CREATE TYPE "LembreteAntecedencia" AS ENUM ('NENHUM', 'NO_DIA', 'UM_DIA_ANTES', 'TRES_DIAS_ANTES', 'UMA_SEMANA_ANTES');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EspacoFinanceiro" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EspacoFinanceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembroEspaco" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "papel" "PapelMembro" NOT NULL DEFAULT 'EDITOR',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembroEspaco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convite" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "emailConvidado" TEXT NOT NULL,
    "papel" "PapelMembro" NOT NULL DEFAULT 'EDITOR',
    "status" "StatusConvite" NOT NULL DEFAULT 'PENDENTE',
    "token" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEm" TIMESTAMP(3),
    "expiraEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Convite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conta" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "saldoInicial" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoCategoria" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GrupoCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "grupoId" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" "TipoCategoria" NOT NULL DEFAULT 'AMBOS',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegraCategorizacao" (
    "id" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "palavraChave" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegraCategorizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerieRecorrencia" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "tipo" "TipoSerie" NOT NULL,
    "frequenciaUnidade" "FrequenciaUnidade",
    "frequenciaIntervalo" INTEGER,
    "indeterminada" BOOLEAN NOT NULL DEFAULT false,
    "totalOcorrencias" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SerieRecorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "tipo" "TipoTransacao" NOT NULL,
    "data" DATE NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "consolidado" BOOLEAN NOT NULL DEFAULT false,
    "nota" TEXT,
    "lembreteAntecedencia" "LembreteAntecedencia",
    "lembreteEnviadoEm" TIMESTAMP(3),
    "transferenciaGrupoId" TEXT,
    "serieId" TEXT,
    "numeroParcela" INTEGER,
    "totalParcelas" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrcamentoAnual" (
    "id" TEXT NOT NULL,
    "espacoId" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrcamentoAnual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrcamentoCategoriaMes" (
    "id" TEXT NOT NULL,
    "orcamentoAnualId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "valorPrevisto" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "OrcamentoCategoriaMes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MembroEspaco_usuarioId_espacoId_key" ON "MembroEspaco"("usuarioId", "espacoId");

-- CreateIndex
CREATE UNIQUE INDEX "Convite_token_key" ON "Convite"("token");

-- CreateIndex
CREATE INDEX "Convite_espacoId_idx" ON "Convite"("espacoId");

-- CreateIndex
CREATE INDEX "Convite_emailConvidado_idx" ON "Convite"("emailConvidado");

-- CreateIndex
CREATE INDEX "Conta_espacoId_idx" ON "Conta"("espacoId");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoCategoria_espacoId_nome_key" ON "GrupoCategoria"("espacoId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_espacoId_grupoId_nome_key" ON "Categoria"("espacoId", "grupoId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "RegraCategorizacao_categoriaId_palavraChave_key" ON "RegraCategorizacao"("categoriaId", "palavraChave");

-- CreateIndex
CREATE INDEX "Transacao_espacoId_data_idx" ON "Transacao"("espacoId", "data");

-- CreateIndex
CREATE INDEX "Transacao_contaId_idx" ON "Transacao"("contaId");

-- CreateIndex
CREATE INDEX "Transacao_serieId_idx" ON "Transacao"("serieId");

-- CreateIndex
CREATE INDEX "Transacao_transferenciaGrupoId_idx" ON "Transacao"("transferenciaGrupoId");

-- CreateIndex
CREATE UNIQUE INDEX "OrcamentoAnual_espacoId_ano_key" ON "OrcamentoAnual"("espacoId", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "OrcamentoCategoriaMes_orcamentoAnualId_categoriaId_mes_key" ON "OrcamentoCategoriaMes"("orcamentoAnualId", "categoriaId", "mes");

-- AddForeignKey
ALTER TABLE "MembroEspaco" ADD CONSTRAINT "MembroEspaco_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroEspaco" ADD CONSTRAINT "MembroEspaco_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convite" ADD CONSTRAINT "Convite_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convite" ADD CONSTRAINT "Convite_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conta" ADD CONSTRAINT "Conta_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoCategoria" ADD CONSTRAINT "GrupoCategoria_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoCategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegraCategorizacao" ADD CONSTRAINT "RegraCategorizacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerieRecorrencia" ADD CONSTRAINT "SerieRecorrencia_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "SerieRecorrencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrcamentoAnual" ADD CONSTRAINT "OrcamentoAnual_espacoId_fkey" FOREIGN KEY ("espacoId") REFERENCES "EspacoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrcamentoCategoriaMes" ADD CONSTRAINT "OrcamentoCategoriaMes_orcamentoAnualId_fkey" FOREIGN KEY ("orcamentoAnualId") REFERENCES "OrcamentoAnual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrcamentoCategoriaMes" ADD CONSTRAINT "OrcamentoCategoriaMes_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
