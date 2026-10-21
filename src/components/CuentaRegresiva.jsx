import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    <div className="grid grid-cols-4 gap-2 text-center" role="timer" aria-label="Tiempo que falta para la fiesta">
      {Object.entries(t).map(([k, v]) => (
        <div key={k} className="grid gap-1.5">
          {/* cartela con marco doble; el número gira como una placa al cambiar */}
          <div
            className="relative h-16 grid place-items-center overflow-hidden border border-linea [perspective:300px]"
            style={{ outline: "1px solid var(--c-linea)", outlineOffset: "-5px" }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.b
                key={v}
                className="block font-titulos font-medium text-[clamp(1.7rem,8vw,2.4rem)] leading-none text-destacado tabular-nums"
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                {v}
              </motion.b>
            </AnimatePresence>
          </div>
          <span className="versalita text-suave text-[0.7rem]">{k}</span>
        </div>
      ))}
    </div>
  );
}
