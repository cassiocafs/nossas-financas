import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetMockPrisma } from "../helpers/mockPrisma.js";

vi.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const excluirUsuarioSupabaseAuth = vi.fn();
vi.mock("../../src/lib/supabaseAdmin.js", () => ({ excluirUsuarioSupabaseAuth }));

const { excluirContaUsuario } = await import("../../src/modules/auth/auth.service.js");

const USER_ID = "usuario-1";

beforeEach(() => {
  resetMockPrisma();
  excluirUsuarioSupabaseAuth.mockReset();
  excluirUsuarioSupabaseAuth.mockResolvedValue(undefined);
});

describe("auth.service", () => {
  it("revoga o acesso no Supabase Auth antes de tocar no banco", async () => {
    mockPrisma.membroEspaco.findMany.mockResolvedValue([]);

    await excluirContaUsuario(USER_ID);

    expect(excluirUsuarioSupabaseAuth).toHaveBeenCalledWith(USER_ID);
    expect(mockPrisma.usuario.delete).toHaveBeenCalledWith({ where: { id: USER_ID } });
  });

  it("não toca no banco se a exclusão no Supabase Auth falhar", async () => {
    excluirUsuarioSupabaseAuth.mockRejectedValue(new Error("falhou"));

    await expect(excluirContaUsuario(USER_ID)).rejects.toThrow("falhou");

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("apaga o espaço inteiro quando o usuário é o único membro", async () => {
    mockPrisma.membroEspaco.findMany.mockImplementation(({ where }: any) => {
      if (where.usuarioId === USER_ID) {
        return Promise.resolve([
          { id: "membro-1", espacoId: "espaco-1", usuarioId: USER_ID, papel: "PROPRIETARIO" },
        ]);
      }
      return Promise.resolve([]); // sem outros membros no espaço
    });

    await excluirContaUsuario(USER_ID);

    expect(mockPrisma.transacao.deleteMany).toHaveBeenCalledWith({ where: { espacoId: "espaco-1" } });
    expect(mockPrisma.conta.deleteMany).toHaveBeenCalledWith({ where: { espacoId: "espaco-1" } });
    expect(mockPrisma.espacoFinanceiro.delete).toHaveBeenCalledWith({ where: { id: "espaco-1" } });
    expect(mockPrisma.usuario.delete).toHaveBeenCalledWith({ where: { id: USER_ID } });
  });

  it("em espaço compartilhado, remove só o vínculo e transfere a propriedade", async () => {
    mockPrisma.membroEspaco.findMany.mockImplementation(({ where }: any) => {
      if (where.usuarioId === USER_ID) {
        return Promise.resolve([
          { id: "membro-1", espacoId: "espaco-1", usuarioId: USER_ID, papel: "PROPRIETARIO" },
        ]);
      }
      return Promise.resolve([
        { id: "membro-2", espacoId: "espaco-1", usuarioId: "outro-usuario", papel: "EDITOR" },
      ]);
    });

    await excluirContaUsuario(USER_ID);

    expect(mockPrisma.membroEspaco.update).toHaveBeenCalledWith({
      where: { id: "membro-2" },
      data: { papel: "PROPRIETARIO" },
    });
    expect(mockPrisma.membroEspaco.delete).toHaveBeenCalledWith({ where: { id: "membro-1" } });
    expect(mockPrisma.espacoFinanceiro.delete).not.toHaveBeenCalled();
    expect(mockPrisma.usuario.delete).toHaveBeenCalledWith({ where: { id: USER_ID } });
  });
});
