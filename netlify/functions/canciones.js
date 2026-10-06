// POST   /api/canciones → agrega una canción sugerida
// DELETE /api/canciones → quita una canción sugerida por esa invitación
// En la etapa 4, agregar/quitar también impacta en la playlist de Spotify.
import { db, json, error, buscarInvitacion, cancionesDe, leerJson, FIESTA } from "../lib/util.js";

export default async (req) => {
  const body = await leerJson(req);
  const inv = await buscarInvitacion(body?.codigo);
  if (!inv) return error("Invitación no encontrada", 404);

  if (req.method === "DELETE") {
    await db().sql`DELETE FROM canciones WHERE codigo = ${inv.codigo} AND spotify_id = ${String(body.id ?? "")}`;
    return json(await cancionesDe(inv.codigo));
  }

  const c = body.cancion ?? {};
  if (!c.id || !c.titulo || !c.artista) return error("Canción inválida.");

  const actuales = await cancionesDe(inv.codigo);
  if (actuales.length >= FIESTA.canciones.maxPorInvitacion) {
    return error(`Ya sumaste ${FIESTA.canciones.maxPorInvitacion} canciones.`, 409);
  }

  const insertadas = await db().sql`
    INSERT INTO canciones (codigo, spotify_id, titulo, artista, imagen)
    VALUES (${inv.codigo}, ${String(c.id)}, ${String(c.titulo).slice(0, 200)}, ${String(c.artista).slice(0, 200)}, ${c.imagen ?? null})
    ON CONFLICT (spotify_id) DO NOTHING
    RETURNING id`;
  if (insertadas.length === 0) return error("Esa canción ya está en la playlist.", 409);

  return json(await cancionesDe(inv.codigo));
};

export const config = { path: "/api/canciones", method: ["POST", "DELETE"] };
