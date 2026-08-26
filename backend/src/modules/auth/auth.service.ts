import { PapelMembro, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { excluirUsuarioSupabaseAuth } from "../../lib/supabaseAdmin.js";

type Tx = Prisma.TransactionClient;

async function excluirEspacoCompleto(tx: Tx, espacoId: string) {
  await tx.orcamentoCategoriaMes.deleteMany({ where: { orcamento: { espacoId } } });
  await tx.regraCategorizacao.deleteMany({ where: { categoria: { espacoId } } });
  await tx.regraTransacao.deleteMany({ where: { espacoId } });
  await tx.transacao.deleteMany({ where: { espacoId } });
  await tx.orcamentoAnual.deleteMany({ where: { espacoId } });
  await tx.categoria.deleteMany({ where: { espacoId } });
  await tx.subgrupoCategoria.deleteMany({ where: { espacoId } });
  await tx.grupoCategoria.deleteMany({ where: { espacoId } });
  await tx.conta.deleteMany({ where: { espacoId } });
  await tx.serieRecorrencia.deleteMany({ where: { espacoId } });
  await tx.convite.deleteMany({ where: { espacoId } });
  await tx.membroEspaco.deleteMany({ where: { espacoId } });
  await tx.espacoFinanceiro.delete({ where: { id: espacoId } });
}

/**
 * Exclui a conta do usuário e tudo o que está vinculado a ele: revoga o
 * acesso no Supabase Auth (impedindo login futuro) e remove seus dados do
 * banco. Espaços Financeiros dos quais o usuário é o único membro são
 * apagados por completo; espaços compartilhados só perdem o vínculo do
 * usuário (com a propriedade transferida a outro membro, se necessário).
 */
export async function excluirContaUsuario(userId: string): Promise<void> {
  await excluirUsuarioSupabaseAuth(userId);

  await prisma.$transaction(
    async (tx) => {
      const membros = await tx.membroEspaco.findMany({ where: { usuarioId: userId } });

      for (const membro of membros) {
        const outrosMembros = await tx.membroEspaco.findMany({
          where: { espacoId: membro.espacoId, usuarioId: { not: userId } },
          orderBy: { criadoEm: "asc" },
        });

        if (outrosMembros.length === 0) {
          await excluirEspacoCompleto(tx, membro.espacoId);
          continue;
        }

        if (membro.papel === PapelMembro.PROPRIETARIO) {
          await tx.membroEspaco.update({
            where: { id: outrosMembros[0].id },
            data: { papel: PapelMembro.PROPRIETARIO },
          });
        }

        await tx.membroEspaco.delete({ where: { id: membro.id } });
      }

      await tx.convite.deleteMany({ where: { criadoPorId: userId } });
      await tx.usuario.delete({ where: { id: userId } });
    },
    { timeout: 15_000 },
  );
}
