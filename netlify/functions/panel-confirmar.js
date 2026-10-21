// POST /api/panel/confirmar → carga o cambia la confirmación de una invitación desde el panel
// (para quien confirma por teléfono). No tiene en cuenta la fecha límite.
import { json, error, buscarInvitacion, leerJson } from "../lib/util.js";
import { exigirPanel } from "../lib/auth.js";
import { validarConfirmacion, guardarConfirmacion } from "../lib/confirmaciones.js";

export default async (req) => {
  const noAutorizado = exigirPanel(req);
  if (noAutorizado) return noAutorizado;

  const body = await leerJson(req);
  const inv = await buscarInvitacion(body?.codigo);
  if (!inv) return error("Invitación no encontrada", 404);

  const r = validarConfirmacion(inv, body);
  if (r.error) return error(r.error);
  return json(await guardarConfirmacion(inv.codigo, r.datos));
};

export const config = { path: "/api/panel/confirmar", method: "POST" };
