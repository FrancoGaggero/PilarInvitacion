import { useMemo } from "react";

// Pétalos de peonía que caen lento y girando. Solo CSS (transform/opacity).
export default function PetalosCayendo({ petalos, cantidad = 9 }) {
  const lista = useMemo(
    () => Array.from({ length: cantidad }, (_, i) => ({
      src: petalos[i % petalos.length],
      left: `${5 + Math.random() * 90}%`,
      ancho: 14 + Math.random() * 16,
      dur: 11 + Math.random() * 9,
      delay: -Math.random() * 20,
      deriva: `${(Math.random() - 0.5) * 120}px`,
      giro: `${(Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360)}deg`,
    })),
    [petalos, cantidad]
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {lista.map((p, i) => (
        <img
          key={i}
          src={p.src}
          alt=""
          className="absolute -top-10 petalo"
          style={{
            left: p.left, width: p.ancho,
            animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`,
            "--deriva": p.deriva, "--giro": p.giro,
          }}
        />
      ))}
    </div>
  );
}
