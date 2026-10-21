import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import MarcoFoto from "./MarcoFoto";
import Filigrana from "./ornamentos/Filigrana";

// Carrusel horizontal (pensado para deslizar con el dedo): la foto del centro
// queda derecha y grande, las de los costados se inclinan y achican.
export default function Galeria({ fotos }) {
  const carril = useRef(null);
  return (
    <section id="momentos" className="my-16 -mx-4" aria-label="Fotos de Pilar">
      <div className="text-center px-6">
        <p className="versalita text-suave m-0 mb-1">El book</p>
        <h2 className="titulo-seccion">Mis momentos</h2>
        <Filigrana className="mx-auto mt-2 mb-6" />
      </div>
      <div
        ref={carril}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-[14%] py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((f) => (
          <Diapositiva key={f.src} foto={f} carril={carril} />
        ))}
      </div>
      <p className="versalita text-suave text-center text-[0.7rem] mt-2">Deslizá para ver más ⟶</p>
    </section>
  );
}

function Diapositiva({ foto, carril }) {
  const ref = useRef(null);
  const { scrollXProgress } = useScroll({ container: carril, target: ref, axis: "x", offset: ["start end", "end start"] });
  const rotar = useTransform(scrollXProgress, [0, 0.5, 1], [7, 0, -7]);
  const escala = useTransform(scrollXProgress, [0, 0.5, 1], [0.86, 1, 0.86]);
  const opacidad = useTransform(scrollXProgress, [0, 0.5, 1], [0.55, 1, 0.55]);

  return (
    <motion.div ref={ref} className="snap-center shrink-0 w-[72%] max-w-[22rem]" style={{ rotate: rotar, scale: escala, opacity: opacidad }}>
      <MarcoFoto {...foto} />
    </motion.div>
  );
}

// Foto suelta entre secciones, con una frase en letra script que aparece encima.
export function FotoSuelta({ foto, frase }) {
  return (
    <figure className="relative my-16 mx-auto w-[82%] max-w-[24rem]">
      <MarcoFoto {...foto} />
      {frase && (
        <motion.figcaption
          className="font-script text-acento text-center text-[clamp(2.2rem,10vw,3rem)] leading-tight mt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {frase}
        </motion.figcaption>
      )}
    </figure>
  );
}
