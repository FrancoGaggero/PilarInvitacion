// DELETE /api/panel/canciones → borra una canción sugerida { id }
// (En la etapa 4 también la quita de la playlist de Spotify.)
import { db, json, leerJson } from "../lib/util.js";
import { exigirPanel } from "../lib/auth.js";

export default async (req) => {
  const noAutorizado = exigirPanel(req);
  if (noAutorizado) return noAutorizado;
  const body = await leerJson(req);
  await db().sql`DELETE FROM canciones WHERE id = ${Number(body?.id) || 0}`;
  return json({ ok: true });
};

export const config = { path: "/api/panel/canciones", method: "DELETE" };
