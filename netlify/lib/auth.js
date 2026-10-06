// Autenticación simple del panel: una contraseña (variable PANEL_PASSWORD en Netlify)
// y un token firmado que vence a los 7 días.
import { createHmac, timingSafeEqual } from "node:crypto";
import { error } from "./util.js";

const DURACION_MS = 7 * 24 * 3600e3;
const secreto = () => process.env.PANEL_PASSWORD || globalThis.Netlify?.env?.get("PANEL_PASSWORD") || "";

const firmar = (vence) => createHmac("sha256", secreto()).update(`panel:${vence}`).digest("hex");

const iguales = (a, b) => {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  return A.length === B.length && timingSafeEqual(A, B);
};

export function passwordConfigurada() {
  return secreto().length >= 6;
}

export function passwordCorrecta(intento) {
  return passwordConfigurada() && iguales(intento ?? "", secreto());
}

export function crearToken() {
  const vence = Date.now() + DURACION_MS;
  return `${vence}.${firmar(vence)}`;
}

// Devuelve null si el pedido está autorizado, o una Response de error si no.
export function exigirPanel(req) {
  if (!passwordConfigurada()) return error("Falta configurar PANEL_PASSWORD en Netlify.", 503);
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const [vence, firma] = token.split(".");
  if (!vence || !firma || Number(vence) < Date.now() || !iguales(firma, firmar(vence))) {
    return error("Sesión vencida. Volvé a ingresar.", 401);
  }
  return null;
}
