/**
 * Importa um extrato XLS (formato: Data Ocorrência | Descrição | Valor | Categoria | Conta)
 * direto para o banco, reaproveitando a mesma lógica do endpoint de importação
 * (backend/src/modules/importacao/importacao.service.ts).
 *
 * Uso:
 *   npx tsx prisma/importar-extrato.ts ../xls-transacoes/Extrato_20230101_20231231.xls
 *   npx tsx prisma/importar-extrato.ts ../xls-transacoes/*.xls   (vários arquivos de uma vez)
 *
 * Por padrão usa o espaço de esteyceecassio@gmail.com. Para importar em outro espaço:
 *   ESPACO_ID=<id> npx tsx prisma/importar-extrato.ts <arquivo>
 */
import { basename } from "node:path";
import { readFileSync } from "node:fs";
import "dotenv/config";

// Este script faz milhares de queries sequenciais. Usar a URL com pgbouncer (pooler)
// aqui compete pelo pool limitado do Supabase com o backend, que já fica rodando em
// paralelo (npm run dev), e estoura o timeout do pool do Prisma (P2024) no meio da
// importação. A conexão direta evita esse problema para cargas longas como esta.
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const { prisma } = await import("../src/lib/prisma.js");
const { importarTransacoesXls } = await import("../src/modules/importacao/importacao.service.js");

const ESPACO_ID = process.env.ESPACO_ID ?? "dc0c26a4-6caa-4658-9a4d-2f5fa33d4025"; // esteyceecassio@gmail.com

async function main() {
  const caminhos = process.argv.slice(2);
  if (caminhos.length === 0) {
    throw new Error("Uso: npx tsx prisma/importar-extrato.ts <caminho-do-arquivo.xls> [outro.xls ...]");
  }

  const arquivos = caminhos.map((caminho) => ({
    nome: basename(caminho),
    buffer: readFileSync(caminho),
  }));

  const resultado = await importarTransacoesXls(ESPACO_ID, arquivos, (processadas, total) => {
    process.stdout.write(`\rProcessando... ${processadas}/${total}`);
  });

  console.log("\n");
  console.log(`Total de linhas: ${resultado.totalLinhas}`);
  console.log(`Importadas: ${resultado.importadas}`);
  console.log(`Contas criadas: ${resultado.contasCriadas.join(", ") || "nenhuma"}`);
  console.log(`Categorias criadas: ${resultado.categoriasCriadas.join(", ") || "nenhuma"}`);
  if (resultado.erros.length > 0) {
    console.log(`\nErros (${resultado.erros.length}):`);
    for (const erro of resultado.erros) {
      console.log(`  ${erro.arquivo} linha ${erro.linha}: ${erro.motivo}`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
