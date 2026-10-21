import { FIESTA } from "../config/fiesta";
import Seccion from "./Seccion";

export default function DressCode() {
  const { titulo, texto, coloresReservados } = FIESTA.dressCode;
  return (
    <Seccion id="dresscode" antetitulo="Etiqueta" titulo="Dress code">
      <div className="text-center">
        <p className="versalita text-destacado text-[1.35rem] tracking-[0.3em] m-0 mb-4">{titulo}</p>
        <p className="italic text-suave text-xl m-0">{texto}</p>
        {coloresReservados.length > 0 && (
          <div className="flex items-center justify-center gap-2.5 mt-6 flex-wrap">
            {coloresReservados.map((c) => (
              <span key={c} className="w-8 h-8 rounded-full border border-acento" style={{ background: c }} title={c} />
            ))}
            <span className="w-full text-sm text-suave">Colores reservados para la cumpleañera</span>
          </div>
        )}
      </div>
    </Seccion>
  );
}
