import { apiFetch } from "./client";

export function excluirContaUsuario(): Promise<void> {
  return apiFetch<void>("/api/auth/me", { method: "DELETE" });
}
