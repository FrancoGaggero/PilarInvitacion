import { Component, lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FIESTA } from "../config/fiesta";
import { FLORES } from "../assets/flores";

const Destellos = lazy(() => import("./Destellos"));

// Pantalla de entrada: un sobre lacrado. Al tocar el sello estalla en destellos
// (Lottie), se abre la solapa, sube la tarjeta y aparece la invitación.
const ease = [0.65, 0, 0.35, 1];
const papel = "var(--c-papel)";
const papelSombra = "var(--c-papel-sombra)";

export default function Intro({ nombre, onAbrir }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    import("./Destellos"); // precarga mientras la persona mira el sobre
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const abrir = () => {
    if (abierto) return;
    setAbierto(true);
    setTimeout(onAbrir, 2600);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center px-6 overflow-hidden"
      style={{ background: "var(--c-fondo)" }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
    >
      <div className="w-full max-w-[24rem] text-center">
        <motion.p
          className="versalita text-suave m-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: abierto ? 0 : 1 }}
          transition={{ duration: 1 }}
        >
          Una invitación para
        </motion.p>
        <motion.p
          className="font-script text-acento text-[clamp(2.6rem,12vw,3.4rem)] leading-tight mt-1 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: abierto ? 0 : 1, y: 0 }}
          transition={{ duration: 1, delay: abierto ? 0 : 0.3 }}
        >
          {nombre}
        </motion.p>

        <button
          type="button"
          onClick={abrir}
          aria-label="Abrir la invitación"
          className="relative block w-full bg-transparent border-0 p-0 cursor-pointer"
        >
          <motion.svg
            viewBox="0 -130 300 330"
            className="block w-full h-auto overflow-visible"
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,.5))" }}
          >
            {/* fondo del sobre */}
            <rect x="0" y="0" width="300" height="200" rx="3" style={{ fill: papelSombra, stroke: "var(--c-acento)", strokeWidth: 1 }} />

            {/* solapa abierta (queda detrás de la tarjeta) */}
            <motion.path
              d="M0 0 L150 -110 L300 0 Z"
              style={{ fill: papelSombra, stroke: "var(--c-acento)", strokeWidth: 1, originY: 1 }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: abierto ? 1 : 0 }}
              transition={{ duration: 0.35, delay: abierto ? 0.75 : 0, ease: "easeOut" }}
            />

            {/* tarjeta que sube */}
            <motion.g
              initial={{ y: 0 }}
              animate={{ y: abierto ? -86 : 0 }}
              transition={{ duration: 1, delay: 1.2, ease }}
            >
              <rect x="22" y="14" width="256" height="184" style={{ fill: papel, stroke: "var(--c-acento)", strokeWidth: 1.5 }} />
              <rect x="30" y="22" width="240" height="168" style={{ fill: "none", stroke: "var(--c-acento)", strokeWidth: 0.6 }} />
              <text x="150" y="52" textAnchor="middle" className="font-versal" fontSize="11" letterSpacing="3" style={{ fill: "var(--c-bordo)" }}>
                MIS QUINCE AÑOS
              </text>
              <text x="150" y="104" textAnchor="middle" className="font-script" fontSize="48" style={{ fill: "var(--c-bordo)" }}>
                {FIESTA.nombre}
              </text>
            </motion.g>

            {/* bolsillo delantero */}
            <path d="M0 0 L132 108 Q150 120 168 108 L300 0 L300 200 L0 200 Z" style={{ fill: papel }} />
            <path d="M0 200 L128 100 M300 200 L172 100" style={{ stroke: papelSombra, strokeWidth: 1.2 }} />
            {/* contorno sin borde superior: la tarjeta tiene que pasar por delante al subir */}
            <path
              d="M0 0 L0 200 L300 200 L300 0 M0 0 L132 108 Q150 120 168 108 L300 0"
              style={{ fill: "none", stroke: "var(--c-acento)", strokeWidth: 1, strokeLinejoin: "round" }}
            />

            {/* solapa cerrada: se pliega hacia arriba */}
            <motion.path
              d="M0 0 L150 120 L300 0 Z"
              style={{ fill: papel, stroke: "var(--c-acento)", strokeWidth: 1, originY: 0 }}
              initial={{ scaleY: 1 }}
              animate={{ scaleY: abierto ? 0 : 1 }}
              transition={{ duration: 0.4, delay: abierto ? 0.35 : 0, ease: "easeIn" }}
            />

            {/* lacre */}
            <motion.g
              style={{ originX: 0.5, originY: 0.5 }}
              initial={{ scale: 1 }}
              animate={abierto ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] } : { scale: [1, 1.05, 1] }}
              transition={abierto ? { duration: 0.5, ease: "easeOut" } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                d={selloBorde(150, 118, 27, 1.6, 24)}
                style={{ fill: "var(--c-bordo)", filter: "drop-shadow(0 2px 2px rgba(0,0,0,.4))" }}
              />
              <circle cx="150" cy="118" r="19" style={{ fill: "none", stroke: "var(--c-acento)", strokeWidth: 1 }} />
              <text x="150" y="130" textAnchor="middle" className="font-script" fontSize="30" style={{ fill: "var(--c-destacado)" }}>
                {FIESTA.nombre[0]}
              </text>
            </motion.g>
          </motion.svg>

          {/* peonía apoyada junto al lacre */}
          <motion.img
            src={FLORES.peonia}
            alt=""
            aria-hidden="true"
            className="absolute left-[20%] top-[60%] w-[30%] pointer-events-none"
            style={{ filter: "drop-shadow(0 6px 6px rgba(0,0,0,.35))" }}
            initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
            animate={abierto ? { opacity: 0, y: 40, rotate: -60 } : { opacity: 1, rotate: -16, scale: 1 }}
            transition={abierto ? { duration: 0.5 } : { type: "spring", stiffness: 160, damping: 14, delay: 0.9 }}
          />
          {abierto && (
            <SinRomper>
              <Suspense fallback={null}>
                <Destellos className="absolute left-1/2 top-[75.2%] w-[130%] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              </Suspense>
            </SinRomper>
          )}
        </button>

        <motion.p
          className="versalita text-acento mt-10 mb-0"
          animate={abierto ? { opacity: 0 } : { opacity: [0.35, 1, 0.35] }}
          transition={abierto ? { duration: 0.3 } : { duration: 2.4, repeat: Infinity }}
        >
          Tocá el sello para abrir
        </motion.p>
      </div>
    </motion.div>
  );
}

// Si los destellos no cargan (sin conexión, etc.), el sobre se abre igual
class SinRomper extends Component {
  state = { roto: false };
  static getDerivedStateFromError() { return { roto: true }; }
  render() { return this.state.roto ? null : this.props.children; }
}

// Borde ondulado de un sello de lacre
function selloBorde(cx, cy, r, onda, n) {
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = r + (i % 2 ? -onda : onda * 0.4);
    return `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join(" L")} Z`;
}
