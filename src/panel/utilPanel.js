import { FIESTA } from "../config/fiesta";
import { fechaLarga, hora, limiteTexto } from "../lib/fechas";

export const linkInvitacion = (codigo) => `${window.location.origin}/i/${codigo}`;

export function mensajeWhatsApp(inv) {
  const tuteo = inv.tipo === "personal";
  return (
    `¡Hola ${inv.nombre}! 💜\n` +
    `${tuteo ? "Te invito" : "Los invito"} a festejar mis 15 el ${fechaLarga.toLowerCase()} a las ${hora} en ${FIESTA.lugar}.\n\n` +
    `En este link ${tuteo ? "podés" : "pueden"} ver todos los detalles, confirmar la asistencia y sumar canciones para la fiesta:\n` +
    `${linkInvitacion(inv.codigo)}\n\n` +
    `${FIESTA.nombre}`
  );
}

export function mensajeRecordatorio(inv) {
  const tuteo = inv.tipo === "personal";
  return (
    `¡Hola ${inv.nombre}! 💜\n` +
    `Te escribo para recordarte que ${tuteo ? "todavía no confirmaste" : "todavía no confirmaron"} si ${tuteo ? "venís" : "vienen"} a mis 15. ` +
    `${tuteo ? "Podés" : "Pueden"} hacerlo en este link hasta el ${limiteTexto}:\n` +
    `${linkInvitacion(inv.codigo)}\n\n` +
    `${FIESTA.nombre}`
  );
}

export const linkWhatsApp = (inv) => `https://wa.me/?text=${encodeURIComponent(mensajeWhatsApp(inv))}`;
export const linkRecordatorio = (inv) => `https://wa.me/?text=${encodeURIComponent(mensajeRecordatorio(inv))}`;

// confirmada | no-asiste | esperando (enviada sin respuesta) | sin-enviar
export function estadoDe(inv) {
  if (inv.asiste === true) return "confirmada";
  if (inv.asiste === false) return "no-asiste";
  return inv.enviada ? "esperando" : "sin-enviar";
}

export const fechaCorta = (iso) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "America/Argentina/Buenos_Aires" });

// Convierte el texto pegado en una lista de invitaciones.
// Formato: una por línea, "Nombre, cupo". Sin cupo = 1 (invitación personal).
export function parsearLista(texto) {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linea) => {
      const m = linea.match(/^(.*?)[,;\t]\s*(\d+)\s*$/);
      return m ? { nombre: m[1].trim(), cupo: Number(m[2]) } : { nombre: linea, cupo: 1 };
    });
}

// Exporta a CSV que Excel abre bien en español (separador ; y BOM para los acentos)
export function descargarCSV(nombreArchivo, filas) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "\uFEFF" + filas.map((f) => f.map(esc).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: nombreArchivo });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
