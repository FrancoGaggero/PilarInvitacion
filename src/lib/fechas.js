import { FIESTA } from "../config/fiesta";

const TZ = "America/Argentina/Buenos_Aires";
export const fechaFiesta = new Date(FIESTA.fecha);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const fechaLarga = cap(
  fechaFiesta.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ })
);
export const fechaCorta = fechaFiesta.toLocaleDateString("es-AR", { day: "numeric", month: "long", timeZone: TZ });
export const hora =
  fechaFiesta.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }) + " h";

export const limiteConfirmacion = new Date(FIESTA.confirmarHasta + "T23:59:59-03:00");
export const limiteTexto = limiteConfirmacion.toLocaleDateString("es-AR", { day: "numeric", month: "long", timeZone: TZ });

const gcal = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
export const linkCalendario = () => {
  const fin = new Date(fechaFiesta.getTime() + FIESTA.duracionHoras * 3600e3);
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(`15 de ${FIESTA.nombre}`) +
    "&dates=" + gcal(fechaFiesta) + "/" + gcal(fin) +
    "&location=" + encodeURIComponent(`${FIESTA.lugar}, ${FIESTA.direccion}`) +
    "&details=" + encodeURIComponent(`Dress code: ${FIESTA.dressCode.titulo}`)
  );
};
export const linkMapa = () =>
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(FIESTA.mapsQuery);
