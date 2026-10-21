import { motion } from "framer-motion";
import { FIESTA } from "../../config/fiesta";

// Cartela con corona de laureles y la inicial: se dibuja trazo a trazo
// y después aparece la letra con un brillo dorado.
// Hojas en dos filas alternadas (adentro/afuera del aro), inclinadas hacia arriba
const HOJAS = Array.from({ length: 12 }, (_, i) => {
  const grados = 230 - i * 10; // recorre el arco izquierdo, de abajo hacia arriba
  const a = (grados * Math.PI) / 180;
  const afuera = i % 2 === 0;
  const r = afuera ? 77 : 71;
  return { x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a), rot: grados - 180 + (afuera ? -35 : 35) };
});
const HOJA = "M0 0 C-5 -6 -5 -14 0 -20 C5 -14 5 -6 0 0 Z";

export default function Monograma({ className = "", letra = FIESTA.nombre[0], retraso = 0 }) {
  const trazo = (d) => ({
    oculto: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 1.6, delay: retraso + d, ease: "easeInOut" } },
  });

  return (
    <motion.svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={`block ${className}`}
      initial="oculto"
      animate="visible"
      fill="none"
      style={{ stroke: "var(--c-acento)" }}
      strokeLinecap="round"
    >
      <motion.circle cx="100" cy="100" r="88" strokeWidth="1.4" variants={trazo(0)} />
      <motion.circle cx="100" cy="100" r="81" strokeWidth="0.8" strokeDasharray="1 5" variants={trazo(0.3)} />
      {[0, 1].map((lado) => (
        <g key={lado} transform={lado ? "translate(200 0) scale(-1 1)" : undefined}>
          {HOJAS.map((h, i) => (
            <motion.path
              key={i}
              d={HOJA}
              transform={`translate(${h.x} ${h.y}) rotate(${h.rot})`}
              strokeWidth="1"
              style={{ fill: "color-mix(in srgb, var(--c-acento) 18%, transparent)" }}
              variants={trazo(0.5 + i * 0.08)}
            />
          ))}
        </g>
      ))}
      {/* moño de abajo */}
      <motion.path d="M84 178 C92 170 108 170 116 178 M100 172 L92 192 M100 172 L108 192" strokeWidth="1.2" variants={trazo(1.2)} />
      <motion.text
        x="100" y="128" textAnchor="middle"
        className="font-script"
        fontSize="104"
        stroke="none"
        style={{ fill: "var(--c-destacado)" }}
        variants={{
          oculto: { opacity: 0, scale: 0.85 },
          visible: { opacity: 1, scale: 1, transition: { duration: 1.2, delay: retraso + 1.3, ease: "easeOut" } },
        }}
      >
        {letra}
      </motion.text>
    </motion.svg>
  );
}
