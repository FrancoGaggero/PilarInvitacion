import { getDatabase } from "@netlify/database";
import { FIESTA } from "../../src/config/fiesta.js";

export const db = () => getDatabase();
export { FIESTA };

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export const error = (mensaje, status = 400) => json({ error: mensaje }, status);

export const plazoCerrado = () => new Date() > new Date(FIESTA.confirmarHasta + "T23:59:59-03:00");

export async function buscarInvitacion(codigo) {
  if (!codigo || !/^[a-z0-9]{4,20}$/i.test(codigo)) return null;
  const [inv] = await db().sql`SELECT codigo, nombre, tipo, cupo FROM invitaciones WHERE codigo = ${codigo}`;
  return inv ?? null;
}

export async function cancionesDe(codigo) {
  return db().sql`
    SELECT spotify_id AS id, titulo, artista, imagen
    FROM canciones WHERE codigo = ${codigo} ORDER BY creada`;
}

export async function leerJson(req) {
  try { return await req.json(); } catch { return null; }
}
