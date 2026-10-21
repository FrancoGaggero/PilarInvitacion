import { motion } from "framer-motion";

// Divisor de volutas que se dibuja solo al entrar en pantalla.
const LADO = [
  "M110 20 C96 20 92 8 80 8 C70 8 66 18 72 23 C77 27 84 22 81 17",
  "M110 20 C96 20 92 32 80 32 C72 32 69 27 70 24",
  "M70 20 L16 20",
  "M58 20 C53 14 46 14 42 20 C46 26 53 26 58 20 Z",
];

const dibujo = {
  oculto: { pathLength: 0, opacity: 0 },
  visible: (i) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.4, delay: 0.15 * i, ease: "easeInOut" }, opacity: { duration: 0.2, delay: 0.15 * i } },
  }),
};

export default function Filigrana({ className = "" }) {
  return (
    <motion.svg
      viewBox="0 0 240 40"
      aria-hidden="true"
      className={`block w-56 max-w-full h-auto ${className}`}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      fill="none"
      style={{ stroke: "var(--c-acento)" }}
      strokeWidth="1.1"
      strokeLinecap="round"
    >
      {[0, 1].map((lado) => (
        <g key={lado} transform={lado ? "translate(240 0) scale(-1 1)" : undefined}>
          {LADO.map((d, i) => <motion.path key={i} d={d} variants={dibujo} custom={i} />)}
          <motion.circle cx="11" cy="20" r="1.8" style={{ fill: "var(--c-acento)" }} variants={dibujo} custom={4} />
        </g>
      ))}
      <motion.path d="M120 11 L127 20 L120 29 L113 20 Z" variants={dibujo} custom={0} style={{ fill: "var(--c-bordo)" }} />
    </motion.svg>
  );
}
