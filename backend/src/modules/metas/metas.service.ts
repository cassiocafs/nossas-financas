import type { Meta, AporteMeta } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import { formatDataISO, hojeUTC } from "../../lib/datas.js";
import { toNumber } from "../../lib/decimal.js";
import type {
  CriarMetaInput,
  EditarMetaInput,
  RegistrarAporteInput,
} from "./metas.schemas.js";

export type EstadoMeta =
  | "sem_aporte"
  | "em_andamento"
  | "quase_la"
  | "concluida"
  | "atrasada";

export interface MetaSerializada {
  id: string;
  nome: string;
  emoji: string | null;
  valorAlvo: number;
  valorAtual: number;
  dataAlvo: string | null;
  progresso: number;
  faltam: number;
  estado: EstadoMeta;
  concluidaEm: string | null;
  arquivada: boolean;
  aporteMensalSugerido: number | null;
  ultimoAporteEm: string | null;
}

export interface AporteSerializado {
  id: string;
  valor: number;
  data: string;
  nota: string | null;
  criadoEm: string;
}

interface Derivados {
  valorAtual: number;
  ultimoAporteEm: Date | null;
}

function chaveMes(data: Date): number {
  return data.getUTCFullYear() * 12 + data.getUTCMonth();
}

function calcularDerivados(
  meta: Meta,
  { valorAtual, ultimoAporteEm }: Derivados,
): MetaSerializada {
  const valorAlvo = toNumber(meta.valorAlvo);
  const progresso = valorAlvo > 0 ? Math.min(100, (valorAtual / valorAlvo) * 100) : 0;
  const faltam = Math.max(0, valorAlvo - valorAtual);

  const hoje = hojeUTC();
  const mesHoje = chaveMes(hoje);
  const mesAlvo = meta.dataAlvo ? chaveMes(meta.dataAlvo) : null;

  const concluida = valorAtual >= valorAlvo;
  const atrasada = !concluida && mesAlvo !== null && mesAlvo < mesHoje;

  let estado: EstadoMeta;
  if (concluida) estado = "concluida";
  else if (atrasada) estado = "atrasada";
  else if (progresso >= 75) estado = "quase_la";
  else if (valorAtual === 0) estado = "sem_aporte";
  else estado = "em_andamento";

  let aporteMensalSugerido: number | null = null;
  if (meta.dataAlvo && faltam > 0 && mesAlvo !== null && mesAlvo >= mesHoje) {
    const mesesRestantes = Math.max(1, mesAlvo - mesHoje);
    aporteMensalSugerido = faltam / mesesRestantes;
  }

  return {
    id: meta.id,
    nome: meta.nome,
    emoji: meta.emoji,
    valorAlvo,
    valorAtual,
    dataAlvo: meta.dataAlvo ? formatDataISO(meta.dataAlvo) : null,
    progresso,
    faltam,
    estado,
    concluidaEm: meta.concluidaEm ? meta.concluidaEm.toISOString() : null,
    arquivada: meta.arquivada,
    aporteMensalSugerido,
    ultimoAporteEm: ultimoAporteEm ? formatDataISO(ultimoAporteEm) : null,
  };
}

function serializarAporte(aporte: AporteMeta): AporteSerializado {
  return {
    id: aporte.id,
    valor: toNumber(aporte.valor),
    data: formatDataISO(aporte.data),
    nota: aporte.nota,
    criadoEm: aporte.criadoEm.toISOString(),
  };
}

async function agregarAportes(
  espacoId: string,
  metaIds: string[],
): Promise<Map<string, Derivados>> {
  const mapa = new Map<string, Derivados>(
    metaIds.map((id) => [id, { valorAtual: 0, ultimoAporteEm: null }]),
  );
  if (metaIds.length === 0) return mapa;

  const somas = await prisma.aporteMeta.groupBy({
    by: ["metaId"],
    where: { espacoId, metaId: { in: metaIds } },
    _sum: { valor: true },
    _max: { data: true },
  });

  for (const linha of somas) {
    mapa.set(linha.metaId, {
      valorAtual: toNumber(linha._sum.valor),
      ultimoAporteEm: linha._max.data ?? null,
    });
  }
  return mapa;
}

/** Mantém `concluidaEm` coerente com o valor acumulado: seta ao atingir a meta, limpa se cair abaixo. */
async function sincronizarConclusao(
  meta: Meta,
  valorAtual: number,
): Promise<Meta> {
  const atingiu = valorAtual >= toNumber(meta.valorAlvo);
  if (atingiu && !meta.concluidaEm) {
    return prisma.meta.update({ where: { id: meta.id }, data: { concluidaEm: new Date() } });
  }
  if (!atingiu && meta.concluidaEm) {
    return prisma.meta.update({ where: { id: meta.id }, data: { concluidaEm: null } });
  }
  return meta;
}

export async function listarMetas(
  espacoId: string,
  incluirArquivadas: boolean,
): Promise<MetaSerializada[]> {
  const metas = await prisma.meta.findMany({
    where: { espacoId, ...(incluirArquivadas ? {} : { arquivada: false }) },
    orderBy: [{ criadoEm: "asc" }],
  });

  const derivados = await agregarAportes(
    espacoId,
    metas.map((m) => m.id),
  );

  return metas.map((m) =>
    calcularDerivados(m, derivados.get(m.id) ?? { valorAtual: 0, ultimoAporteEm: null }),
  );
}

export async function buscarMeta(
  espacoId: string,
  id: string,
): Promise<MetaSerializada & { aportes: AporteSerializado[] }> {
  const meta = await prisma.meta.findFirst({ where: { id, espacoId } });
  if (!meta) throw new HttpError(404, "Meta não encontrada");

  const aportes = await prisma.aporteMeta.findMany({
    where: { espacoId, metaId: id },
    orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
  });

  const valorAtual = aportes.reduce((soma, a) => soma + toNumber(a.valor), 0);
  const ultimoAporteEm = aportes.reduce<Date | null>(
    (max, a) => (max === null || a.data > max ? a.data : max),
    null,
  );

  return {
    ...calcularDerivados(meta, { valorAtual, ultimoAporteEm }),
    aportes: aportes.map(serializarAporte),
  };
}

export async function criarMeta(
  espacoId: string,
  input: CriarMetaInput,
): Promise<MetaSerializada> {
  const meta = await prisma.meta.create({
    data: {
      espacoId,
      nome: input.nome,
      emoji: input.emoji ?? null,
      valorAlvo: input.valorAlvo,
      dataAlvo: input.dataAlvo ?? null,
    },
  });

  return calcularDerivados(meta, { valorAtual: 0, ultimoAporteEm: null });
}

export async function editarMeta(
  espacoId: string,
  id: string,
  input: EditarMetaInput,
): Promise<MetaSerializada> {
  const existente = await prisma.meta.findFirst({ where: { id, espacoId } });
  if (!existente) throw new HttpError(404, "Meta não encontrada");

  const meta = await prisma.meta.update({
    where: { id },
    data: {
      ...(input.nome !== undefined ? { nome: input.nome } : {}),
      ...(input.emoji !== undefined ? { emoji: input.emoji ?? null } : {}),
      ...(input.valorAlvo !== undefined ? { valorAlvo: input.valorAlvo } : {}),
      ...(input.dataAlvo !== undefined ? { dataAlvo: input.dataAlvo ?? null } : {}),
      ...(input.arquivada !== undefined ? { arquivada: input.arquivada } : {}),
    },
  });

  const derivados = await agregarAportes(espacoId, [id]);
  const { valorAtual, ultimoAporteEm } = derivados.get(id) ?? {
    valorAtual: 0,
    ultimoAporteEm: null,
  };
  const metaFinal = await sincronizarConclusao(meta, valorAtual);
  return calcularDerivados(metaFinal, { valorAtual, ultimoAporteEm });
}

export async function excluirMeta(
  espacoId: string,
  id: string,
  confirmar: boolean,
): Promise<void> {
  const meta = await prisma.meta.findFirst({ where: { id, espacoId } });
  if (!meta) throw new HttpError(404, "Meta não encontrada");

  const aportes = await prisma.aporteMeta.count({ where: { espacoId, metaId: id } });
  if (aportes > 0 && !confirmar) {
    throw new HttpError(409, "Meta possui aportes registrados", { aportes });
  }

  await prisma.meta.delete({ where: { id } });
}

export async function registrarAporte(
  espacoId: string,
  metaId: string,
  input: RegistrarAporteInput,
): Promise<{ meta: MetaSerializada; aporte: AporteSerializado }> {
  const meta = await prisma.meta.findFirst({ where: { id: metaId, espacoId } });
  if (!meta) throw new HttpError(404, "Meta não encontrada");

  const aporte = await prisma.aporteMeta.create({
    data: {
      metaId,
      espacoId,
      valor: input.valor,
      data: input.data,
      nota: input.nota ?? null,
    },
  });

  const derivados = await agregarAportes(espacoId, [metaId]);
  const { valorAtual, ultimoAporteEm } = derivados.get(metaId) ?? {
    valorAtual: 0,
    ultimoAporteEm: null,
  };
  const metaFinal = await sincronizarConclusao(meta, valorAtual);

  return {
    meta: calcularDerivados(metaFinal, { valorAtual, ultimoAporteEm }),
    aporte: serializarAporte(aporte),
  };
}

export async function removerAporte(
  espacoId: string,
  metaId: string,
  aporteId: string,
): Promise<{ meta: MetaSerializada }> {
  const meta = await prisma.meta.findFirst({ where: { id: metaId, espacoId } });
  if (!meta) throw new HttpError(404, "Meta não encontrada");

  const aporte = await prisma.aporteMeta.findFirst({
    where: { id: aporteId, metaId, espacoId },
  });
  if (!aporte) throw new HttpError(404, "Aporte não encontrado");

  await prisma.aporteMeta.delete({ where: { id: aporteId } });

  const derivados = await agregarAportes(espacoId, [metaId]);
  const { valorAtual, ultimoAporteEm } = derivados.get(metaId) ?? {
    valorAtual: 0,
    ultimoAporteEm: null,
  };
  const metaFinal = await sincronizarConclusao(meta, valorAtual);

  return { meta: calcularDerivados(metaFinal, { valorAtual, ultimoAporteEm }) };
}
