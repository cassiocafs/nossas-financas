// Deve ser o PRIMEIRO import de src/index.ts, antes de qualquer módulo que
// faça I/O. Ajusta limites de threads ANTES de o libuv inicializar seu pool.
//
// Motivo: na hospedagem compartilhada da Hostinger o limite "Máximo de
// processos" (NPROC do CloudLinux) conta processos E threads da conta inteira.
// Cada processo Node soma o threadpool do libuv (4 por padrão) + threads do
// V8 + threads do engine do Prisma. Sob concorrência o LiteSpeed sobe várias
// instâncias do app e a conta encosta no teto (throttling, erros 5xx).
//
// Em produção, defina também UV_THREADPOOL_SIZE / NODE_OPTIONS nas variáveis de
// ambiente do painel; este fallback garante o valor mesmo sem configurá-las.
if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = "2";
}
