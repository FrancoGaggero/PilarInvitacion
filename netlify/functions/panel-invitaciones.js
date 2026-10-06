// POST   /api/panel/invitaciones → crea una o varias invitaciones { items: [{ nombre, cupo }] }
// PATCH  /api/panel/invitaciones → edita nombre/cupo { codigo, nombre, cupo }
// DELETE /api/panel/invitaciones → borra { codigo } (y su confirmación y canciones)
import { randomBytes } from "node:crypto";
import { db, json, error, leerJson } from "../lib/util.js";
import { exigirPanel } from "../lib/auth.js";

// Sin letras ni números que se confundan (0/o, 1/l/i)
const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789";
const nuevoCodigo = () => [...randomBytes(7)].map((b) => ALFABETO[b % ALFABETO.length]).join("");

function validar(item) {
  const nombre = String(item?.nombre ?? "").trim().slice(0, 80);
  const cupo = Number(item?.cupo ?? 1);
  if (!nombre) return { error: "Falta el nombre." };
  if (!Number.isInteger(cupo) || cupo < 1 || cupo > 20) return { error: `Cupo inválido para "${nombre}".` };
  return { nombre, cupo, tipo: cupo === 1 ? "personal" : "familia" };
}

export default async (req) => {
  const noAutorizado = exigirPanel(req);
  if (noAutorizado) return noAutorizado;
  const body = await leerJson(req);

  if (req.method === "DELETE") {
    await db().sql`DELETE FROM invitaciones WHERE codigo = ${String(body?.codigo ?? "")}`;
    return json({ ok: true });
  }

  if (req.method === "PATCH") {
    const v = validar(body);
    if (v.error) return error(v.error);
    const [fila] = await db().sql`
      UPDATE invitaciones SET nombre = ${v.nombre}, cupo = ${v.cupo}, tipo = ${v.tipo}
      WHERE codigo = ${String(body?.codigo ?? "")} RETURNING codigo`;
    if (!fila) return error("Invitación no encontrada", 404);
    return json({ ok: true });
  }

  const items = Array.isArray(body?.items) ? body.items.slice(0, 300) : [];
  if (items.length === 0) return error("No hay invitaciones para crear.");
  const validos = items.map(validar);
  const conError = validos.find((v) => v.error);
  if (conError) return error(conError.error);

  const creadas = [];
  for (const v of validos) {
    for (let intento = 0; intento < 5; intento++) {
      const codigo = nuevoCodigo();
      const filas = await db().sql`
        INSERT INTO invitaciones (codigo, nombre, tipo, cupo)
        VALUES (${codigo}, ${v.nombre}, ${v.tipo}, ${v.cupo})
        ON CONFLICT (codigo) DO NOTHING RETURNING codigo`;
      if (filas.length) { creadas.push({ codigo, ...v }); break; }
    }
  }
  return json({ creadas });
};

export const config = { path: "/api/panel/invitaciones", method: ["POST", "PATCH", "DELETE"] };
