import { FIESTA } from "../config/fiesta";
import { fechaLarga, hora, linkCalendario, linkMapa } from "../lib/fechas";
import CuentaRegresiva from "./CuentaRegresiva";

export default function Evento() {
  return (
    <section id="evento" className="seccion">
      <h2 className="titulo-seccion">Cuándo y dónde</h2>
      <CuentaRegresiva />
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 m-0">
        <dt className="text-suave">Fecha</dt><dd className="m-0">{fechaLarga}</dd>
        <dt className="text-suave">Hora</dt><dd className="m-0">{hora}</dd>
        <dt className="text-suave">Lugar</dt><dd className="m-0">{FIESTA.lugar}</dd>
        <dt className="text-suave">Dirección</dt><dd className="m-0">{FIESTA.direccion}</dd>
      </dl>
      <div className="flex flex-wrap gap-3 mt-7">
        <a className="btn-borde" href={linkMapa()} target="_blank" rel="noopener">Cómo llegar</a>
        <a className="btn-borde" href={linkCalendario()} target="_blank" rel="noopener">Agendar en Google Calendar</a>
      </div>
    </section>
  );
}
