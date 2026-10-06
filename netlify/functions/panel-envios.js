// POST /api/panel/envios → registra un envío { codigo, tipo: "invitacion" | "recordatorio" | "desmarcar" }
import { db, json, error, leerJson } from "../lib/util.js";
import { exigirPanel } from "../lib/auth.js";

export default async (req) => {
  const noAutorizado = exigirPanel(req);
  if (noAutorizado) return noAutorizado;
  const body = await leerJson(req);
  const codigo = String(body?.codigo ?? "");

  let filas;
  if (body?.tipo === "invitacion") {
    // Solo guarda la primera fecha de envío
    filas = await db().sql`
      UPDATE invitaciones SET enviada = COALESCE(enviada, now())
      WHERE codigo = ${codigo} RETURNING enviada, recordatorio`;
  } else if (body?.tipo === "recordatorio") {
    filas = await db().sql`
      UPDATE invitaciones SET enviada = COALESCE(enviada, now()), recordatorio = now()
      WHERE codigo = ${codigo} RETURNING enviada, recordatorio`;
  } else if (body?.tipo === "desmarcar") {
    filas = await db().sql`
      UPDATE invitaciones SET enviada = NULL, recordatorio = NULL
      WHERE codigo = ${codigo} RETURNING enviada, recordatorio`;
  } else {
    return error("Tipo de envío inválido.");
  }
  if (!filas.length) return error("Invitación no encontrada", 404);
  return json(filas[0]);
};

export const config = { path: "/api/panel/envios", method: "POST" };
