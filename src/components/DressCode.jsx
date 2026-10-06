import { FIESTA } from "../config/fiesta";

export default function DressCode() {
  const { titulo, texto, coloresReservados } = FIESTA.dressCode;
  return (
    <section id="dresscode" className="seccion">
      <h2 className="titulo-seccion">Dress code</h2>
      <p className="font-titulos text-[clamp(2rem,8vw,2.6rem)] text-destacado mb-4">{titulo}</p>
      <p className="text-suave">{texto}</p>
      {coloresReservados.length > 0 && (
        <div className="flex items-center gap-2.5 mt-5 flex-wrap">
          {coloresReservados.map((c) => (
            <span key={c} className="w-8 h-8 rounded-full border border-linea" style={{ background: c }} title={c} />
          ))}
          <span className="text-sm text-suave">Colores reservados para la cumpleañera</span>
        </div>
      )}
    </section>
  );
}
