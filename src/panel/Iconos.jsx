// Íconos del panel (trazos simples, 24×24, heredan el color del texto)
const TRAZOS = {
  whatsapp: "M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6L3 21zM9 8.5c0 3.5 3 6.5 6.5 6.5l1.5-1.5-2-1.5-1 1c-1.2-.4-2.1-1.3-2.5-2.5l1-1L11 7.5 9 8.5z",
  campana: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0",
  enlace: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  ojo: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  lapiz: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  papelera: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  confirmar: "M16 11l2 2 4-4M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1",
  actualizar: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  salir: "M15 4h4v16h-4M10 16l-4-4 4-4M6 12h10",
  mas: "M12 5v14M5 12h14",
  descargar: "M12 4v11M7 10l5 5 5-5M5 20h14",
  cubiertos: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5v4h3v9",
  cerrar: "M6 6l12 12M18 6L6 18",
  check: "M5 12l5 5 9-10",
  enviado: "M4 12l16-8-6 16-2-7-8-1z",
};

export default function Icono({ nombre, className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`shrink-0 ${className}`} fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}
