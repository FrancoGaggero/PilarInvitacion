// POST /api/confirmar → guarda o actualiza la confirmación de una invitación
import { db, json, error, buscarInvitacion, leerJson, plazoCerrado } from "../lib/util.js";

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export default async (req) => {
  if (plazoCerrado()) return error("El plazo para confirmar ya terminó.", 403);

  const body = await leerJson(req);
  const inv = await buscarInvitacion(body?.codigo);
  if (!inv) return error("Invitación no encontrada", 404);

  if (!["si", "no"].includes(body.asiste)) return error("Falta indicar si asisten.");
  const asiste = body.asiste === "si";

  let cantidad = 0;
  let nombres = [];
  if (asiste) {
    cantidad = Number(body.cantidad) || 1;
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > inv.cupo) {
      return error(`La invitación tiene ${inv.cupo} ${inv.cupo === 1 ? "lugar" : "lugares"}.`);
    }
    if (inv.tipo === "familia") {
      nombres = (Array.isArray(body.nombres) ? body.nombres : []).slice(0, cantidad).map((n) => texto(n, 80));
      if (nombres.length !== cantidad || nombres.some((n) => !n)) return error("Falta el nombre de alguna persona.");
    } else {
      nombres = [inv.nombre];
    }
  }

  const restricciones = asiste ? texto(body.restricciones, 300) : "";
  const mensaje = texto(body.mensaje, 500);

  const [conf] = await db().sql`
    INSERT INTO confirmaciones (codigo, asiste, cantidad, nombres, restricciones, mensaje, actualizada)
    VALUES (${inv.codigo}, ${asiste}, ${cantidad}, ${JSON.stringify(nombres)}::jsonb, ${restricciones}, ${mensaje}, now())
    ON CONFLICT (codigo) DO UPDATE SET
      asiste = EXCLUDED.asiste, cantidad = EXCLUDED.cantidad, nombres = EXCLUDED.nombres,
      restricciones = EXCLUDED.restricciones, mensaje = EXCLUDED.mensaje, actualizada = now()
    RETURNING asiste, cantidad, nombres, restricciones, mensaje, actualizada`;

  return json({ ...conf, asiste: conf.asiste ? "si" : "no" });
};

export const config = { path: "/api/confirmar", method: "POST" };
