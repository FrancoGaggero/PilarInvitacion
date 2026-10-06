// Capa de datos: cada función llama a una Netlify Function (carpeta netlify/functions).
// Los componentes no saben de dónde salen los datos.

async function pedir(url, opciones = {}) {
  const res = await fetch(url, {
    ...opciones,
    headers: { "content-type": "application/json", ...(opciones.headers || {}) },
  });
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
