import { useEffect, useState } from "react";
import { fechaFiesta } from "../lib/fechas";

function calcular() {
  let ms = Math.max(0, fechaFiesta - new Date());
  const d = Math.floor(ms / 864e5); ms -= d * 864e5;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  const m = Math.floor(ms / 6e4); ms -= m * 6e4;
  return { días: d, horas: h, min: m, seg: Math.floor(ms / 1e3) };
}

export default function CuentaRegresiva() {
  const [t, setT] = useState(calcular);
  useEffect(() => {
    const id = setInterval(() => setT(calcular()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 text-center my-6" role="timer" aria-label="Tiempo que falta para la fiesta">
      {Object.entries(t).map(([k, v]) => (
        <div key={k} className="py-3">
          <b className="block font-titulos font-normal text-[clamp(2rem,9vw,2.8rem)] leading-none text-destacado">{v}</b>
          <span className="text-sm text-suave">{k}</span>
        </div>
      ))}
    </div>
  );
}
