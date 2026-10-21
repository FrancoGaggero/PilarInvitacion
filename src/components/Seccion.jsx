import { motion } from "framer-motion";
import Esquinas from "./ornamentos/Esquinas";
import Filigrana from "./ornamentos/Filigrana";

// Tarjeta victoriana que sube sobre el fondo fijo: marco doble, esquineros,
// título en letra script y filigrana que se dibuja.
export default function Seccion({ id, antetitulo, titulo, children }) {
  return (
    <motion.section
      id={id}
      className="seccion"
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Esquinas />
      {antetitulo && <p className="versalita text-suave text-center m-0 mb-1">{antetitulo}</p>}
      <h2 className="titulo-seccion">{titulo}</h2>
      <Filigrana className="mx-auto mt-2 mb-8" />
      {children}
    </motion.section>
  );
}
