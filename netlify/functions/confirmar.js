// POST /api/confirmar → guarda o actualiza la confirmación de una invitación
import { json, error, buscarInvitacion, leerJson, plazoCerrado } from "../lib/util.js";
import { validarConfirmacion, guardarConfirmacion } from "../lib/confirmaciones.js";

export default async (req) => {
  if (plazoCerrado()) return error("El plazo para confirmar ya terminó.", 403);

  const body = await leerJson(req);
  const inv = await buscarInvitacion(body?.codigo);
  if (!inv) return error("Invitación no encontrada", 404);

  const r = validarConfirmacion(inv, body);
  if (r.error) return error(r.error);
  return json(await guardarConfirmacion(inv.codigo, r.datos));
};

export const config = { path: "/api/confirmar", method: "POST" };
