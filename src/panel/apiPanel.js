// Llamadas del panel privado. El token se guarda en este navegador por 7 días.
const CLAVE = "panel-token";

export const leerToken = () => {
  try { return localStorage.getItem(CLAVE); } catch { return null; }
};
export const guardarToken = (t) => {
  try { t ? localStorage.setItem(CLAVE, t) : localStorage.removeItem(CLAVE); } catch {}
};

async function pedir(url, opciones = {}) {
  const res = await fetch(url, {
    ...opciones,
    headers: { "content-type": "application/json", authorization: `Bearer ${leerToken() || ""}` },
  });
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(datos.error || "Hubo un problema de conexión.");
    e.status = res.status;
    throw e;
  }
  return datos;
}

export async function ingresar(password) {
  const { token } = await pedir("/api/panel/login", { method: "POST", body: JSON.stringify({ password }) });
  guardarToken(token);
}

export const obtenerDatos = () => pedir("/api/panel/datos");
export const crearInvitaciones = (items) =>
  pedir("/api/panel/invitaciones", { method: "POST", body: JSON.stringify({ items }) });
export const editarInvitacion = (codigo, nombre, cupo) =>
  pedir("/api/panel/invitaciones", { method: "PATCH", body: JSON.stringify({ codigo, nombre, cupo }) });
export const borrarInvitacion = (codigo) =>
  pedir("/api/panel/invitaciones", { method: "DELETE", body: JSON.stringify({ codigo }) });
export const borrarCancion = (id) =>
  pedir("/api/panel/canciones", { method: "DELETE", body: JSON.stringify({ id }) });
export const registrarEnvio = (codigo, tipo) =>
  pedir("/api/panel/envios", { method: "POST", body: JSON.stringify({ codigo, tipo }) });
