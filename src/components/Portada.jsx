import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FIESTA } from "../config/fiesta";
import { fechaLarga } from "../lib/fechas";
import Monograma from "./ornamentos/Monograma";
import Filigrana from "./ornamentos/Filigrana";
import PolvoDorado from "./ornamentos/PolvoDorado";

export default function Portada({ invitacion }) {
  const quieto = useReducedMotion();
  const ahorroDatos = typeof navigator !== "undefined" && navigator.connection?.saveData;
  const [hayVideo, setHayVideo] = useState(Boolean(FIESTA.video?.src));
  const saludo =
    invitacion.tipo === "familia"
      ? `${invitacion.nombre}, los invito a festejar`
      : `${invitacion.nombre}, te invito a festejar`;

  // El video queda fijo detrás; al scrollear se apaga y el contenido sube por encima
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacidadVideo = useTransform(scrollYProgress, [0, 0.9], [1, 0]);
  const escalaVideo = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const yTexto = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const opacidadTexto = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const entrar = (delay) => ({
    initial: quieto ? false : { opacity: 0, y: 16, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 1.4, delay, ease: "easeOut" },
  });

  return (
    <header ref={ref} className="relative min-h-svh grid place-items-center text-center py-16">
      {hayVideo && (
        <motion.div aria-hidden="true" className="fixed inset-0 -z-[5] pointer-events-none overflow-hidden" style={{ opacity: opacidadVideo }}>
          <motion.video
            className="w-full h-full object-cover"
            style={{ scale: escalaVideo, filter: "sepia(.25) saturate(.85) brightness(.75)" }}
            src={quieto || ahorroDatos ? undefined : FIESTA.video.src}
            poster={FIESTA.video.poster}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            onError={() => setHayVideo(false)}
          />
          {/* velo vino para que el texto se lea siempre */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--c-fondo) 70%, transparent) 0%, color-mix(in srgb, var(--c-fondo) 35%, transparent) 40%, var(--c-fondo) 100%)",
            }}
          />
        </motion.div>
      )}

      <PolvoDorado />

      <motion.div className="relative px-6 w-full max-w-[34rem]" style={{ y: yTexto, opacity: opacidadTexto }}>
        <Monograma className="w-32 h-32 mx-auto mb-6" retraso={0.3} />
        <motion.p className="italic text-suave text-xl m-0" {...entrar(1.6)}>{saludo}</motion.p>
        <motion.p className="versalita text-acento mt-3 mb-0" {...entrar(1.9)}>Mis quince años</motion.p>
        <motion.h1
          className="font-script font-normal brillo-oro text-[clamp(5.5rem,30vw,10rem)] leading-[1.15] m-0 px-4"
          {...entrar(2.1)}
        >
          {FIESTA.nombre}
        </motion.h1>
        <Filigrana className="mx-auto my-3" />
        <motion.p className="text-destacado text-2xl m-0" {...entrar(2.6)}>{fechaLarga}</motion.p>
      </motion.div>

      <motion.a
        href="#evento"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 no-underline text-suave hover:text-texto grid justify-items-center gap-1"
        initial={quieto ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2 }}
      >
        <span className="versalita">Abrí la invitación</span>
        <motion.svg
          viewBox="0 0 24 24" className="w-6 h-6" fill="none" style={{ stroke: "var(--c-acento)" }} strokeWidth="1.2"
          animate={quieto ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M6 9 L12 15 L18 9" />
        </motion.svg>
      </motion.a>
    </header>
  );
}
