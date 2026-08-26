import { env } from "../env.js";

/**
 * Exclui o usuário no Supabase Auth via Admin API, revogando o acesso e
 * impedindo login futuro com essa conta. Requer a service_role key, que só
 * existe no backend (nunca deve ser exposta ao frontend).
 */
export async function excluirUsuarioSupabaseAuth(userId: string): Promise<void> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada — não é possível excluir o usuário no Supabase Auth",
    );
  }

  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  // 404 significa que o usuário já não existe no Supabase Auth — trata como sucesso.
  if (!res.ok && res.status !== 404) {
    const corpo = await res.text().catch(() => "");
    throw new Error(
      `Falha ao excluir usuário no Supabase Auth (status ${res.status}): ${corpo}`,
    );
  }
}
