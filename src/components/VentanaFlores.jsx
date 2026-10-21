import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { FIESTA } from "../config/fiesta";
import { FLORES } from "../assets/flores";
import FlorFlotante from "./flores/FlorFlotante";
import Filigrana from "./ornamentos/Filigrana";

// Sección "ventana": el video de peonías queda FIJO en la pantalla y solo se ve
// a través de esta sección (clip-path recorta incluso a los hijos position:fixed).
// Mientras se scrollea, la frase y las flores pasan por encima del fondo quieto.
// Importante: ningún contenedor de esta sección puede tener transform, porque
// rompería el position:fixed del video.
export default function VentanaFlores() {
  const { src, poster, frase } = FIESTA.videoFlores;
  const quieto = useReducedMotion();
  const ahorroDatos = typeof navigator !== "undefined" && navigator.connection?.saveData;
  const ref = useRef(null);
  const video = useRef(null);
  const visible = useInView(ref, { margin: "200px 0px" });
  const [hayVideo, setHayVideo] = useState(true);

  // Solo reproduce mientras la ventana está cerca de la pantalla (cuida batería)
  useEffect(() => {
    const v = video.current;
    if (!v || quieto || ahorroDatos) return;
    if (visible) v.play().catch(() => {});
    else v.pause();
  }, [visible, quieto, ahorroDatos]);

  return (
    <section ref={ref} aria-label="Peonías" className="relative -mx-4 my-16 h-[120vh]" style={{ clipPath: "inset(0)" }}>
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ background: `var(--c-fondo) url(${poster}) center / cover` }}>
        {hayVideo && !quieto && !ahorroDatos && (
          <video
            ref={video}
            className="w-full h-full object-cover"
            style={{ filter: "sepia(.2) saturate(.9) brightness(.8)" }}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setHayVideo(false)}
          />
        )}
        {/* velo vino arriba y abajo para que la ventana se funda con el fondo */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, var(--c-fondo) 0%, var(--c-velo-suave) 25%, var(--c-velo-suave) 75%, var(--c-fondo) 100%)" }}
        />
      </div>

      <div className="relative h-full grid place-items-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Filigrana className="mx-auto mb-3" />
          <p
            className="font-script text-destacado text-[clamp(3rem,14vw,4.4rem)] leading-[1.1] m-0"
            style={{ textShadow: "0 2px 18px rgba(0,0,0,.65)" }}
          >
            {frase}
          </p>
          <Filigrana className="mx-auto mt-4" />
        </motion.div>
      </div>

      <FlorFlotante src={FLORES.capullo} className="-left-6 top-[8%] w-28" velocidad={-160} giro={-18} />
      <FlorFlotante src={FLORES.rama} className="-right-12 bottom-[10%] w-52" velocidad={-220} giro={160} />
    </section>
  );
}
