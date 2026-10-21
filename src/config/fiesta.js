// ============================================================
//  DATOS DE LA FIESTA — todo lo que se muestra sale de acá
// ============================================================
export const FIESTA = {
  nombre: "Pilar",
  nombreCompleto: "Pilar Crespo",

  // Fecha y hora en horario de Argentina (UTC-3)
  fecha: "2027-07-07T21:00:00-03:00",
  duracionHoras: 6,

  lugar: "Jano's Ituzaingó",
  direccion: "Domingo Olivera y Cnel. Ventura Alegre, B1714 Ituzaingó, Provincia de Buenos Aires",
  mapsQuery: "Jano's Ituzaingó, Domingo Olivera y Coronel Ventura Alegre, Ituzaingó",

  dressCode: {
    titulo: "Elegante",
    texto: "Vestido largo o de cóctel, traje o saco. Vení con tu mejor versión: es una noche para lucirse.",
    // Colores que solo usa la cumpleañera (dejar vacío [] si no hay)
    coloresReservados: [],
  },

  // Fecha límite para confirmar (año-mes-día)
  confirmarHasta: "2027-03-10",

  canciones: {
    maxPorInvitacion: 5,
  },

  // Video de fondo de la portada (archivos en /public/video). Muted y en loop.
  // Si el archivo no está, la portada queda con el fondo damasco.
  video: {
    src: "/video/portada.mp4",
    poster: "/video/portada.jpg",
  },

  // Video de peonías que se ve fijo a través de la sección "ventana" (VentanaFlores.jsx)
  videoFlores: {
    src: "/video/flores.mp4",
    poster: "/video/flores.jpg",
    frase: "Florecer también es crecer",
  },

  // Fotos del book. Por ahora son de PRUEBA: reemplazar src por las reales
  // (ideal: verticales 3:4, ~1200 px de alto, en /public/book).
  // forma: "ovalo" | "arco" | "marco"
  book: [
    { src: "https://picsum.photos/seed/pilar-1/900/1200", alt: "Pilar sonriendo", forma: "ovalo" },
    { src: "https://picsum.photos/seed/pilar-2/900/1200", alt: "Pilar con su vestido", forma: "arco" },
    { src: "https://picsum.photos/seed/pilar-3/900/1200", alt: "Pilar en el jardín", forma: "marco" },
    { src: "https://picsum.photos/seed/pilar-4/900/1200", alt: "Retrato de Pilar", forma: "arco" },
    { src: "https://picsum.photos/seed/pilar-5/900/1200", alt: "Pilar mirando a cámara", forma: "ovalo" },
    { src: "https://picsum.photos/seed/pilar-6/900/1200", alt: "Pilar riendo", forma: "marco" },
    { src: "https://picsum.photos/seed/pilar-7/900/1200", alt: "Detalle del vestido", forma: "arco" },
  ],
};
