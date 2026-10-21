// Fondo fijo de toda la invitación: papel tapiz damasco + viñeta.
// Es una capa position:fixed (background-attachment:fixed no funciona en iPhone),
// y todo el contenido scrollea por encima.
const trazo = { stroke: "var(--c-acento)", strokeOpacity: 0.08, fill: "var(--c-fondo-2)", fillOpacity: 0.4 };

export default function FondoFijo() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id="damasco" width="120" height="170" patternUnits="userSpaceOnUse">
            <g strokeWidth="1.1" style={trazo}>
              <path d="M60 28 C71 48 88 55 86 77 C84 94 67 99 60 124 C53 99 36 94 34 77 C32 55 49 48 60 28 Z" />
              <path d="M60 52 C66 64 73 70 71 80 C69 89 62 91 60 102 C58 91 51 89 49 80 C47 70 54 64 60 52 Z" />
              <path d="M34 77 C22 75 16 64 22 58 C27 53 35 58 31 64" fill="none" />
              <path d="M86 77 C98 75 104 64 98 58 C93 53 85 58 89 64" fill="none" />
              <path d="M60 124 L60 146 M52 136 C56 140 64 140 68 136" fill="none" />
              <path d="M60 10 C63 15 63 20 60 24 C57 20 57 15 60 10 Z" />
              {[[0, 0], [120, 0], [0, 170], [120, 170], [0, 85], [120, 85]].map(([x, y]) => (
                <path key={`${x}-${y}`} d={`M${x} ${y - 9} L${x + 6} ${y} L${x} ${y + 9} L${x - 6} ${y} Z`} />
              ))}
            </g>
          </pattern>
          <radialGradient id="vineta" cx="50%" cy="45%" r="75%">
            <stop offset="45%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" style={{ fill: "var(--c-fondo)" }} />
        <rect width="100%" height="100%" fill="url(#damasco)" />
        <rect width="100%" height="100%" fill="url(#vineta)" />
      </svg>
    </div>
  );
}
