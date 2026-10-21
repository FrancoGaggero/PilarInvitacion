import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// Flor suelta que se mueve con el scroll a otra velocidad que el contenido
// (el fondo queda fijo, las flores "flotan" por encima).
// Se ubica con `className` (posición absoluta, ancho) dentro de un contenedor relativo.
//   velocidad: cuántos px se desplaza de más mientras cruza la pantalla (negativo = sube más rápido)
export default function FlorFlotante({ src, className = "", velocidad = -120, giro = 0, opacidad = 1 }) {
  const quieto = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-velocidad, velocidad]);
  const rotate = useTransform(scrollYProgress, [0, 1], [giro - 10, giro + 10]);

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={`absolute pointer-events-none select-none ${className}`}
      style={quieto ? { rotate: giro, opacity: opacidad } : { y, rotate, opacity: opacidad }}
    >
      <img
        src={src}
        alt=""
        draggable="false"
        loading="lazy"
        className="block w-full h-auto balanceo"
        style={{ filter: "drop-shadow(0 12px 14px rgba(0,0,0,.5))" }}
      />
    </motion.div>
  );
}

// Ancla de alto cero para colgar flores entre secciones sin mover el layout
export function Adorno({ children }) {
  return <div aria-hidden="true" className="relative h-0 z-10">{children}</div>;
}
