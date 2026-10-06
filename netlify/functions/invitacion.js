// GET /api/invitacion/:codigo → datos de la invitación, su confirmación y sus canciones
import { db, json, error, buscarInvitacion, cancionesDe } from "../lib/util.js";

export default async (req, context) => {
  const inv = await buscarInvitacion(context.params.codigo);
  if (!inv) return error("Invitación no encontrada", 404);

  const [conf] = await db().sql`
    SELECT asiste, cantidad, nombres, restricciones, mensaje, actualizada
    FROM confirmaciones WHERE codigo = ${inv.codigo}`;

  return json({
    ...inv,
    confirmacion: conf
      ? { ...conf, asiste: conf.asiste ? "si" : "no", restricciones: conf.restricciones ?? "", mensaje: conf.mensaje ?? "" }
      : null,
    canciones: await cancionesDe(inv.codigo),
  });
};

export const config = { path: "/api/invitacion/:codigo", method: "GET" };
