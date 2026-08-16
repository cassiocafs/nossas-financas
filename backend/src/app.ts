import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { contasRouter } from "./modules/contas/contas.routes.js";
import { categoriasRouter } from "./modules/categorias/categorias.routes.js";
import { transacoesRouter } from "./modules/transacoes/transacoes.routes.js";
import { orcamentoRouter } from "./modules/orcamento/orcamento.routes.js";
import { importacaoRouter } from "./modules/importacao/importacao.routes.js";
import { regrasRouter } from "./modules/regras/regras.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/contas", contasRouter);
  app.use("/api/categorias", categoriasRouter);
  app.use("/api/transacoes", transacoesRouter);
  app.use("/api/orcamento", orcamentoRouter);
  app.use("/api/importacoes", importacaoRouter);
  app.use("/api/regras", regrasRouter);

  app.use(errorHandler);

  return app;
}
