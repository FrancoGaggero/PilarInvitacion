// Datos de PRUEBA. Las invitaciones reales viven en Netlify Database;
// esta lista solo se usa para los accesos rápidos en desarrollo.
// tipo: "familia" (cupo 2 o más) | "personal" (cupo 1)
export const MOCK_INVITACIONES = [
  { codigo: "fam7k2p", nombre: "Familia Gómez", tipo: "familia", cupo: 3 },
  { codigo: "fam9x4r", nombre: "Tíos Marta y Hugo", tipo: "familia", cupo: 2 },
  { codigo: "sof3m8q", nombre: "Sofi", tipo: "personal", cupo: 1 },
  { codigo: "cam5t1w", nombre: "Cami", tipo: "personal", cupo: 1 },
];

// Resultados simulados del buscador (se reemplaza por Spotify en la etapa 4)
export const MOCK_CANCIONES = [
  { id: "m1", titulo: "Tusa", artista: "Karol G, Nicki Minaj" },
  { id: "m2", titulo: "Bzrp Music Sessions #53", artista: "Bizarrap, Shakira" },
  { id: "m3", titulo: "La Bachata", artista: "Manuel Turizo" },
  { id: "m4", titulo: "Miénteme", artista: "TINI, María Becerra" },
  { id: "m5", titulo: "Quevedo: Bzrp Music Sessions #52", artista: "Bizarrap, Quevedo" },
  { id: "m6", titulo: "Cupido", artista: "TINI" },
  { id: "m7", titulo: "Flowers", artista: "Miley Cyrus" },
  { id: "m8", titulo: "Ella No Es Tuya", artista: "Rochy RD, Nicki Nicole" },
  { id: "m9", titulo: "Antes de Perderte", artista: "Duki" },
  { id: "m10", titulo: "Dancing Queen", artista: "ABBA" },
  { id: "m11", titulo: "Mi Gente", artista: "J Balvin, Willy William" },
  { id: "m12", titulo: "Ojitos Lindos", artista: "Bad Bunny, Bomba Estéreo" },
];
