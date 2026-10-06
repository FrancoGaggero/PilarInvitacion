import { motion, useReducedMotion } from "framer-motion";
import { FIESTA } from "../config/fiesta";
import { fechaLarga } from "../lib/fechas";

export default function Portada({ invitacion }) {
  const quieto = useReducedMotion();
  const saludo =
    invitacion.tipo === "familia"
      ? `${invitacion.nombre}, los invito a festejar mis quince`
      : `${invitacion.nombre}, te invito a festejar mis quince`;

  return (
    <header className="relative min-h-svh grid place-items-center overflow-hidden text-center py-16">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 grid place-items-center font-titulos leading-[.8] tracking-[-0.04em] text-transparent"
        style={{ fontSize: "min(68vw, 26rem)", WebkitTextStroke: "1px var(--c-acento)" }}
        initial={quieto ? false : { opacity: 0, scale: 1.08 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      >
        15
      </motion.div>

      <motion.div
        className="relative px-6"
        initial={quieto ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
      >
        <p className="text-suave mb-4">{saludo}</p>
        <h1 className="font-titulos text-[clamp(3.4rem,14vw,6.5rem)] leading-none">{FIESTA.nombre}</h1>
        <p className="mt-6 text-lg text-destacado">{fechaLarga}</p>
      </motion.div>

      <a href="#evento" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-suave hover:text-texto no-underline">
        Ver la invitación ↓
      </a>
    </header>
  );
}
