// POST /api/panel/login → { token } si la contraseña es correcta
import { json, error, leerJson } from "../lib/util.js";
import { passwordConfigurada, passwordCorrecta, crearToken } from "../lib/auth.js";

export default async (req) => {
  if (!passwordConfigurada()) return error("Falta configurar PANEL_PASSWORD en Netlify.", 503);
  const body = await leerJson(req);
  if (!passwordCorrecta(body?.password)) {
    await new Promise((r) => setTimeout(r, 800)); // frena intentos repetidos
    return error("Contraseña incorrecta.", 401);
  }
  return json({ token: crearToken() });
};

export const config = { path: "/api/panel/login", method: "POST" };
