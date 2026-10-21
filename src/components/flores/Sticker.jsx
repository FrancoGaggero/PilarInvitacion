import { motion, useReducedMotion } from "framer-motion";

// Borde recortado tipo sticker (marfil) + sombra, hecho con drop-shadows apilados
const BORDE_STICKER =
  "drop-shadow(2px 0 0 #fbf6ec) drop-shadow(-2px 0 0 #fbf6ec) drop-shadow(0 2px 0 #fbf6ec) drop-shadow(0 -2px 0 #fbf6ec) drop-shadow(0 10px 12px rgba(0,0,0,.45))";

// Una flor que "se pega" al aparecer: cae girando, rebota y queda balanceándose.
export default function Sticker({ src, className = "", giro = -10, retraso = 0 }) {
  const quieto = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      initial={quieto ? false : { opacity: 0, scale: 1.7, rotate: giro - 30, y: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: giro, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 13, delay: retraso }}
    >
      <img src={src} alt="" draggable="false" className="block w-full h-auto balanceo" style={{ filter: BORDE_STICKER }} />
    </motion.div>
  );
}
