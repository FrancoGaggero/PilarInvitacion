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
};
