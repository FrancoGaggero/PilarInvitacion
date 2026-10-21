import { useMemo } from "react";

// Partículas doradas que suben flotando. Solo CSS (transform/opacity), liviano en celular.
export default function PolvoDorado({ cantidad = 22 }) {
  const motas = useMemo(
    () => Array.from({ length: cantidad }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${40 + Math.random() * 60}%`,
      tam: 2 + Math.random() * 3,
      dur: 7 + Math.random() * 8,
      delay: -Math.random() * 12,
      deriva: `${(Math.random() - 0.5) * 60}px`,
    })),
    [cantidad]
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {motas.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full mota"
          style={{
            left: m.left, top: m.top, width: m.tam, height: m.tam,
            animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s`, "--deriva": m.deriva,
          }}
        />
      ))}
      <style>{`
        .mota {
          background: radial-gradient(circle, #fff3cf 0%, var(--c-acento) 60%, transparent 100%);
          box-shadow: 0 0 6px 1px var(--c-oro-brillo);
          opacity: 0;
          animation-name: flotar;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes flotar {
          0% { transform: translate(0, 0) scale(.6); opacity: 0; }
          15% { opacity: .9; }
          80% { opacity: .6; }
          100% { transform: translate(var(--deriva), -45vh) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
