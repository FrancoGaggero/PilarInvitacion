import { FIESTA } from "../config/fiesta";
import { fechaLarga, hora, linkCalendario, linkMapa } from "../lib/fechas";
import CuentaRegresiva from "./CuentaRegresiva";
import Seccion from "./Seccion";

export default function Evento() {
  return (
    <Seccion id="evento" antetitulo="La celebración" titulo="Cuándo y dónde">
      <CuentaRegresiva />
      <dl className="grid gap-6 m-0 mt-10 text-center">
        <div>
          <dt className="versalita text-suave">Día</dt>
          <dd className="m-0 mt-1 text-2xl">{fechaLarga}</dd>
        </div>
        <div>
          <dt className="versalita text-suave">Hora</dt>
          <dd className="m-0 mt-1 text-2xl text-destacado">{hora}</dd>
        </div>
        <div>
          <dt className="versalita text-suave">Salón</dt>
          <dd className="m-0 mt-1 font-script text-acento text-[2.6rem] leading-tight">{FIESTA.lugar}</dd>
          <dd className="m-0 mt-1 italic text-suave">{FIESTA.direccion}</dd>
        </div>
      </dl>
      <div className="grid gap-3 mt-9">
        <a className="btn-borde text-center" href={linkMapa()} target="_blank" rel="noopener">Cómo llegar</a>
        <a className="btn-borde text-center" href={linkCalendario()} target="_blank" rel="noopener">Agendar en el calendario</a>
      </div>
    </Seccion>
  );
}
