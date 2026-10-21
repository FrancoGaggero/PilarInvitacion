import { motion } from "framer-motion";
import { FIESTA } from "../config/fiesta";
import Filigrana from "./ornamentos/Filigrana";
import { FLORES } from "../assets/flores";

export default function Pie() {
  return (
    <footer className="text-center pt-10 pb-24 px-6">
      <motion.img
        src={FLORES.ramo}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="block w-44 h-auto mx-auto mb-2 pointer-events-none"
        style={{ filter: "drop-shadow(0 14px 16px rgba(0,0,0,.5))" }}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      />
      <Filigrana className="mx-auto mb-6" />
      <motion.p
        className="font-script text-[clamp(3.5rem,16vw,4.5rem)] leading-tight brillo-oro m-0 px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        ¡Te espero!
      </motion.p>
      <p className="versalita text-suave mt-3">{FIESTA.nombreCompleto}</p>
    </footer>
  );
}
