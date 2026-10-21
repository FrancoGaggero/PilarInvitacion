// Validación y guardado de una confirmación. Lo usan la invitación (/api/confirmar)
// y el panel (/api/panel/confirmar, para quien confirma por teléfono).
import { db, FIESTA } from "./util.js";

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const MENUS = new Set(FIESTA.menus.map((m) => m.id));

// Resumen en texto de los menús de cada persona (columna "restricciones", para exportar)
export function resumenRestricciones(invitados) {
  const nombre = Object.fromEntries(FIESTA.menus.map((m) => [m.id, m.nombre]));
  return invitados
    .map((p) => {
      const items = [...p.menu.map((id) => nombre[id]), p.otra].filter(Boolean);
      return items.length ? `${p.nombre}: ${items.join(", ")}` : "";
    })
    .filter(Boolean)
    .join("; ");
}

// Devuelve { error } o { datos } listos para guardar. No toca la base.
export function validarConfirmacion(inv, body) {
  if (!["si", "no"].includes(body?.asiste)) return { error: "Falta indicar si asisten." };
  const asiste = body.asiste === "si";
  const mensaje = texto(body.mensaje, 500);
  if (!asiste) return { datos: { asiste, cantidad: 0, nombres: [], invitados: [], restricciones: "", mensaje } };

  const cantidad = inv.tipo === "familia" ? Number(body.cantidad) || 1 : 1;
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > inv.cupo) {
    return { error: `La invitación tiene ${inv.cupo} ${inv.cupo === 1 ? "lugar" : "lugares"}.` };
  }

  const recibidos = Array.isArray(body.invitados) ? body.invitados : [];
  const invitados = Array.from({ length: cantidad }, (_, i) => {
    const p = recibidos[i] ?? {};
    return {
      nombre: inv.tipo === "familia" ? texto(p.nombre, 80) : inv.nombre,
      menu: [...new Set(Array.isArray(p.menu) ? p.menu : [])].filter((id) => MENUS.has(id)),
      otra: texto(p.otra, 120),
    };
  });
  if (invitados.some((p) => !p.nombre)) return { error: "Falta el nombre de alguna persona." };

  return {
    datos: {
      asiste, cantidad, invitados, mensaje,
      nombres: invitados.map((p) => p.nombre),
      restricciones: resumenRestricciones(invitados),
    },
  };
}

export async function guardarConfirmacion(codigo, d) {
  const [conf] = await db().sql`
    INSERT INTO confirmaciones (codigo, asiste, cantidad, nombres, invitados, restricciones, mensaje, actualizada)
    VALUES (${codigo}, ${d.asiste}, ${d.cantidad}, ${JSON.stringify(d.nombres)}::jsonb,
            ${JSON.stringify(d.invitados)}::jsonb, ${d.restricciones}, ${d.mensaje}, now())
    ON CONFLICT (codigo) DO UPDATE SET
      asiste = EXCLUDED.asiste, cantidad = EXCLUDED.cantidad, nombres = EXCLUDED.nombres,
      invitados = EXCLUDED.invitados, restricciones = EXCLUDED.restricciones,
      mensaje = EXCLUDED.mensaje, actualizada = now()
    RETURNING asiste, cantidad, nombres, invitados, restricciones, mensaje, actualizada`;
  return { ...conf, asiste: conf.asiste ? "si" : "no" };
}
