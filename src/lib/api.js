// Capa de datos: cada función llama a una Netlify Function (carpeta netlify/functions).
// Los componentes no saben de dónde salen los datos.

import { MOCK_INVITACIONES, MOCK_CANCIONES } from "../data/mockInvitaciones";

// Con `npm run dev` (sin netlify dev) no hay Functions: Vite responde el index.html.
// En ese caso, solo en desarrollo, se usan los datos de prueba para poder diseñar.
let demoCanciones = [];

function demo(url, opciones) {
  const cuerpo = opciones.body ? JSON.parse(opciones.body) : {};
  const codigo = url.match(/\/api\/invitacion\/(.+)$/)?.[1];
  if (codigo) {
    const inv = MOCK_INVITACIONES.find((i) => i.codigo === decodeURIComponent(codigo));
    return inv ? { ...inv, confirmacion: null, canciones: demoCanciones } : null;
  }
  if (url.startsWith("/api/confirmar")) {
    return { ...cuerpo, codigo: undefined, nombres: (cuerpo.invitados || []).map((p) => p.nombre) };
  }
  if (url.startsWith("/api/buscar")) {
    const q = new URL(url, location.origin).searchParams.get("q").toLowerCase();
    return MOCK_CANCIONES.filter((c) => `${c.titulo} ${c.artista}`.toLowerCase().includes(q));
  }
  if (url.startsWith("/api/canciones")) {
    demoCanciones = opciones.method === "DELETE"
      ? demoCanciones.filter((c) => c.id !== cuerpo.id)
      : [...demoCanciones, cuerpo.cancion];
    return demoCanciones;
  }
  throw new Error("Sin API en modo demo. Usá netlify dev.");
}

async function pedir(url, opciones = {}) {
  const res = await fetch(url, {
    ...opciones,
    headers: { "content-type": "application/json", ...(opciones.headers || {}) },
  });
  if (import.meta.env.DEV && !res.headers.get("content-type")?.includes("json")) {
    const r = demo(url, opciones);
    if (r === null) { const e = new Error("No encontrada"); e.status = 404; throw e; }
    return r;
  }
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(datos.error || "Hubo un problema de conexión. Probá de nuevo.");
    e.status = res.status;
    throw e;
  }
  return datos;
}

export async function obtenerInvitacion(codigo) {
  try {
    return await pedir(`/api/invitacion/${encodeURIComponent(codigo)}`);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export const confirmarAsistencia = (codigo, datos) =>
  pedir("/api/confirmar", { method: "POST", body: JSON.stringify({ codigo, ...datos }) });

export const buscarCanciones = (texto) =>
  pedir(`/api/buscar?q=${encodeURIComponent(texto.trim())}`);

export const sugerirCancion = (codigo, cancion) =>
  pedir("/api/canciones", { method: "POST", body: JSON.stringify({ codigo, cancion }) });

export const quitarCancion = (codigo, id) =>
  pedir("/api/canciones", { method: "DELETE", body: JSON.stringify({ codigo, id }) });
