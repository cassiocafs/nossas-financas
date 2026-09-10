// Deve ser o PRIMEIRO import de src/index.ts, antes de qualquer módulo que
// use PrismaClient ou faça I/O.
//
// Motivo: na hospedagem compartilhada da Hostinger o limite "Máximo de
// processos" (NPROC do CloudLinux) conta processos E threads da conta inteira.
// O container expõe 48 núcleos de CPU, e o engine de query do Prisma (Tokio)
// abre ~1 thread por núcleo visível -> ~48 threads ociosas por instância.
// Somando V8 + libuv, cada processo do app fica com ~55 threads; o LiteSpeed
// mantém 2+ instâncias e a conta encosta no teto de 120 (throttling, erros 5xx).
//
// Correções aplicadas aqui:
//  1. UV_THREADPOOL_SIZE: limita o threadpool do libuv (fallback caso a env
//     não esteja definida no painel).
//  2. Afinidade de CPU: prende o processo a poucos núcleos ANTES de o Prisma
//     inicializar. Com menos núcleos visíveis, available_parallelism() cai e
//     o Prisma/Tokio (e o V8) passam a abrir poucas threads.
//
// Em produção defina também no painel: UV_THREADPOOL_SIZE=2 e
// NODE_OPTIONS=--v8-pool-size=2.

import { execSync } from "node:child_process";

if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = "2";
}

// Lista de núcleos aos quais o processo fica preso (formato do taskset, ex.:
// "0-3" ou "0,1"). Ajustável por env; suficiente para uma API de baixo tráfego.
const cpuAffinityList = process.env.CPU_AFFINITY_LIST ?? "0-3";

if (cpuAffinityList !== "off" && process.platform === "linux") {
  const candidates = ["taskset", "/usr/bin/taskset", "/bin/taskset"];
  let ajustado = false;
  for (const bin of candidates) {
    try {
      execSync(`${bin} -cp ${cpuAffinityList} ${process.pid}`, { stdio: "ignore" });
      ajustado = true;
      break;
    } catch {
      // tenta o próximo caminho
    }
  }
  if (!ajustado) {
    console.warn(
      "bootstrap: não foi possível ajustar a afinidade de CPU (taskset ausente " +
        "ou bloqueado). O processo pode consumir muitas threads em hosts com " +
        "muitos núcleos.",
    );
  }
}
