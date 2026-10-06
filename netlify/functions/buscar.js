// GET /api/buscar?q=texto → resultados del buscador de canciones.
// Por ahora devuelve canciones de ejemplo; en la etapa 4 consulta Spotify.
import { json } from "../lib/util.js";
import { MOCK_CANCIONES } from "../../src/data/mockInvitaciones.js";

export default async (req) => {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return json([]);
  const resultados = MOCK_CANCIONES.filter(
    (c) => c.titulo.toLowerCase().includes(q) || c.artista.toLowerCase().includes(q)
  ).slice(0, 10);
  return json(resultados);
};

export const config = { path: "/api/buscar", method: "GET" };
