import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// Bordes de cada forma de marco victoriano
const FORMAS = {
  ovalo: "50%",
  arco: "999px 999px 3px 3px",
  marco: "3px",
};

const revelar = {
  oculto: { clipPath: "inset(0% 0% 100% 0%)" },
  visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.6, ease: [0.65, 0, 0.35, 1] } },
};
const marco = {
  oculto: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.2, delay: 0.6, ease: "easeOut" } },
};

// Foto en marco dorado: se revela de arriba hacia abajo al entrar en pantalla,
// tiene un Ken Burns lento y se desplaza (parallax) con el scroll.
// El whileInView va en el contenedor: un elemento recortado por completo con
// clip-path no cuenta como visible para el IntersectionObserver.
export default function MarcoFoto({ src, alt, forma = "marco", className = "" }) {
  const quieto = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const radio = FORMAS[forma] ?? FORMAS.marco;

  return (
    <motion.div
      ref={ref}
      className={`relative p-2.5 ${className}`}
      initial={quieto ? false : "oculto"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <motion.div className="relative aspect-[3/4] overflow-hidden bg-fondo-2" style={{ borderRadius: radio }} variants={revelar}>
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable="false"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: quieto ? 0 : y, filter: "sepia(.18) saturate(.9) contrast(1.03)" }}
          initial={{ scale: 1.18 }}
          animate={quieto ? undefined : { scale: [1.18, 1.3] }}
          transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
        />
        {/* viñeta interior */}
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 50px rgba(0,0,0,.55)", borderRadius: radio }} />
      </motion.div>
      {/* marco doble dorado */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: radio, border: "1px solid var(--c-acento)" }}
        variants={marco}
      />
      <div
        aria-hidden="true"
        className="absolute inset-2.5 pointer-events-none"
        style={{ borderRadius: radio, border: "2px solid var(--c-acento)" }}
      />
    </motion.div>
  );
}
