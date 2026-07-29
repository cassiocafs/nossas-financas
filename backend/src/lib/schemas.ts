import { z } from "zod";
import { parseDataUTC } from "./datas.js";

export const dataSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida, use o formato AAAA-MM-DD")
  .transform(parseDataUTC);

export const idSchema = z.string().uuid("Identificador inválido");
