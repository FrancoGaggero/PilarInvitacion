// GET /api/panel/datos → todas las invitaciones con su confirmación, y todas las canciones
import { db, json } from "../lib/util.js";
import { exigirPanel } from "../lib/auth.js";

export default async (req) => {
  const noAutorizado = exigirPanel(req);
  if (noAutorizado) return noAutorizado;

  const invitaciones = await db().sql`
    SELECT i.codigo, i.nombre, i.tipo, i.cupo, i.creada,
           c.asiste, c.cantidad, c.nombres, c.restricciones, c.mensaje, c.actualizada
    FROM invitaciones i
    LEFT JOIN confirmaciones c ON c.codigo = i.codigo
    ORDER BY i.creada, i.nombre`;

  const canciones = await db().sql`
    SELECT c.id, c.spotify_id, c.titulo, c.artista, c.creada, i.nombre AS sugerida_por
    FROM canciones c JOIN invitaciones i ON i.codigo = c.codigo
    ORDER BY c.creada DESC`;

  return json({ invitaciones, canciones });
};

export const config = { path: "/api/panel/datos", method: "GET" };
