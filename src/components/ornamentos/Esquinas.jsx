import { motion } from "framer-motion";

// Esquineros dorados que se despliegan en las 4 esquinas de un marco.
const TRAZOS = [
  "M3 57 L3 16 C3 9 9 3 16 3 L57 3",
  "M11 42 C11 24 24 11 42 11",
  "M14 14 C23 14 27 21 23 26 C20 29 15 26 17 22",
];

const POS = [
  "top-0 left-0",
  "top-0 right-0 -scale-x-100",
  "bottom-0 left-0 -scale-y-100",
  "bottom-0 right-0 -scale-100",
];

export default function Esquinas({ tam = "w-12 h-12" }) {
  return POS.map((pos) => (
    <motion.svg
      key={pos}
      viewBox="0 0 60 60"
      aria-hidden="true"
      className={`absolute ${pos} ${tam} pointer-events-none`}
      fill="none"
      style={{ stroke: "var(--c-acento)" }}
      strokeWidth="1.3"
      strokeLinecap="round"
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {TRAZOS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          variants={{
            oculto: { pathLength: 0 },
            visible: { pathLength: 1, transition: { duration: 1.2, delay: 0.3 + i * 0.2, ease: "easeOut" } },
          }}
        />
      ))}
      <motion.circle
        cx="24" cy="24" r="2"
        style={{ fill: "var(--c-acento)" }}
        variants={{ oculto: { scale: 0 }, visible: { scale: 1, transition: { delay: 1.1 } } }}
      />
    </motion.svg>
  ));
}
