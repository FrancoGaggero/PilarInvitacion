// Menús especiales (FIESTA.menus) compartidos por la invitación y el panel.
import { FIESTA } from "../config/fiesta";

export const MENUS = FIESTA.menus;
const NOMBRE = Object.fromEntries(MENUS.map((m) => [m.id, m.nombre]));
export const nombreMenu = (id) => NOMBRE[id] ?? id;

// Lista de personas de una confirmación. Las confirmaciones viejas solo tienen
// nombres + un texto de restricciones: se adaptan al formato nuevo.
export function personasDe(conf) {
  if (!conf) return [];
  if (Array.isArray(conf.invitados) && conf.invitados.length) return conf.invitados;
  return (conf.nombres || []).map((nombre, i) => ({ nombre, menu: [], otra: i === 0 ? conf.restricciones || "" : "" }));
}

// Valores iniciales de un formulario de confirmación (una fila por lugar del cupo)
export function personasIniciales(conf, cupo) {
  const actuales = personasDe(conf);
  return Array.from({ length: cupo }, (_, i) => ({
    nombre: actuales[i]?.nombre ?? "",
    menu: actuales[i]?.menu ?? [],
    otra: actuales[i]?.otra ?? "",
  }));
}

// Arma lo que se manda a la API a partir del formulario (invitación o panel)
export function armarConfirmacion({ asiste, cantidad, invitados, mensaje }, invitacion) {
  const familia = invitacion.tipo === "familia";
  const n = asiste === "si" ? (familia ? Number(cantidad) || 1 : 1) : 0;
  return {
    asiste,
    cantidad: n,
    invitados: invitados.slice(0, n).map((p) => ({
      nombre: familia ? p.nombre.trim() : invitacion.nombre,
      menu: Array.isArray(p.menu) ? p.menu : [],
      otra: (p.otra || "").trim(),
    })),
    mensaje: (mensaje || "").trim(),
  };
}

export const tieneMenuEspecial = (p) => p.menu.length > 0 || Boolean(p.otra);

// "Sin TACC, Vegetariano, alergia a la nuez"
export const textoMenus = (p) => [...p.menu.map(nombreMenu), p.otra].filter(Boolean).join(", ");
