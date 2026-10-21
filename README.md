# Invitación web · 15 de Pilar

Invitación personalizada para los 15 de Pilar Crespo (7 de julio de 2027, Jano's Ituzaingó).

## Tecnologías

- React + Vite, Tailwind CSS, Framer Motion, React Hook Form + Zod
- Netlify (hosting y Functions) y Netlify Database
- API de Spotify para la playlist (última etapa)

## Correr en tu computadora

Requiere Node.js 22 y la CLI de Netlify (`npm i -g netlify-cli`), porque la invitación necesita las Functions y la base de datos.

```bash
npm install
netlify link                          # vincula la carpeta con el sitio de Netlify
netlify database migrations apply     # crea las tablas en la base local
netlify dev
```

Abrí la dirección que muestra `netlify dev` y elegí un invitado de prueba.

Para trabajar solo el diseño alcanza con `npm run dev`: sin Functions, la invitación usa los invitados de `src/data/mockInvitaciones.js` (las confirmaciones y canciones quedan en memoria y no se guardan). Probá con `/?i=fam7k2p` o `/?i=sof3m8q`.

## Estilo (victoriano, bordó y oro)

- **Sobre de entrada** (`Intro.jsx`): al tocar el lacre estalla en destellos (Lottie), se abre la solapa y sube la tarjeta. Se muestra una vez por sesión del navegador.
- **Fondo fijo** (`FondoFijo.jsx`): papel tapiz damasco; todo el contenido scrollea por encima.
- **Video de portada**: fijo detrás de la portada, se apaga al scrollear. Se configura en `FIESTA.video` y los archivos van en `public/video/` (`portada.mp4` muted, ideal ≤ 3 MB, y `portada.jpg` como póster). Si no está, la portada queda con el damasco.
- **Fotos del book**: `FIESTA.book` en `src/config/fiesta.js` (por ahora fotos de prueba). Cada una lleva `forma`: `ovalo`, `arco` o `marco`. Las dos primeras van sueltas entre secciones; el resto, en el carrusel "Mis momentos".
- **Ornamentos animados** (`src/components/ornamentos/`): monograma con laureles, filigranas y esquineros que se dibujan solos, polvo dorado.
- **Destellos Lottie**: `src/assets/lottie/destellos.json` se genera con `node scripts/destellos-lottie.mjs src/assets/lottie/destellos.json` (colores y cantidad dentro del script).
- Con "reducir movimiento" activado en el teléfono no hay sobre ni animaciones, y el video se reemplaza por el póster.

## Base de datos

Netlify Database (Postgres). Se crea sola en el primer deploy porque el proyecto incluye `@netlify/database`, y las tablas se crean con las migraciones de `netlify/database/migrations/`, que Netlify aplica en cada deploy.

| Tabla | Qué guarda |
|---|---|
| `invitaciones` | Código, nombre, tipo (familia o personal) y cupo |
| `confirmaciones` | Si asisten, cuántos, nombres, restricciones alimentarias y mensaje |
| `canciones` | Canciones sugeridas y qué invitación las sugirió |
| `configuracion` | Ajustes generales (permiso de Spotify) |

Para cambiar el esquema, siempre crear una migración nueva; nunca editar una ya aplicada.

## API (Netlify Functions)

| Ruta | Qué hace |
|---|---|
| `GET /api/invitacion/:codigo` | Datos de la invitación, su confirmación y sus canciones |
| `POST /api/confirmar` | Guarda o actualiza la confirmación (valida cupo y fecha límite) |
| `GET /api/buscar?q=` | Buscador de canciones (por ahora de ejemplo) |
| `POST /api/canciones` | Suma una canción (máximo por invitación y sin repetidas) |
| `DELETE /api/canciones` | Quita una canción de esa invitación |
| `POST /api/panel/login` | Ingreso al panel (devuelve un token por 7 días) |
| `GET /api/panel/datos` | Invitaciones, confirmaciones y canciones (requiere token) |
| `POST/PATCH/DELETE /api/panel/invitaciones` | Crear, editar y borrar invitaciones (requiere token) |
| `DELETE /api/panel/canciones` | Quitar una canción (requiere token) |
| `POST /api/panel/envios` | Registra el envío de una invitación o de un recordatorio (requiere token) |

## Panel privado

Está en `/panel` y se protege con la variable de entorno `PANEL_PASSWORD` (mínimo 6 caracteres), que se carga en Netlify en *Project configuration > Environment variables*. Después de crearla o cambiarla hay que hacer un nuevo deploy.

Desde el panel se puede:

- Pegar la lista de invitados (una por línea; `Familia Pérez, 3` para familias, solo el nombre para invitaciones personales).
- Enviar cada invitación por WhatsApp con el mensaje ya escrito, o copiar su link. El panel registra a quién ya se le mandó.
- Mandar un recordatorio a quienes recibieron la invitación y todavía no respondieron.
- Ver quién confirmó, cuántos van, restricciones alimentarias y mensajes.
- Editar o borrar invitaciones y quitar canciones.
- Exportar invitados y canciones a Excel.

## Dónde se cambia cada cosa

| Archivo | Qué contiene |
|---|---|
| `src/config/fiesta.js` | Datos de la fiesta: fecha, salón, dress code, fecha límite, canciones por invitado |
| `src/theme/theme.css` | Colores, tipografías y bordes de toda la invitación |
| `public/video/` | Video y póster de la portada |
| `src/lib/api.js` | Llamadas del frontend a la API |
| `netlify/functions/` | La API |
| `netlify/database/migrations/` | Estructura de la base de datos |
| `src/components/` | Cada sección de la invitación |

## Links de invitación

Cada invitado recibe `https://<sitio>/i/<codigo>`. La familia o amiga ve su nombre, su cupo y su propio formulario.

Invitaciones de prueba cargadas en la base: `fam7k2p` (Familia Gómez, 3), `fam9x4r` (Tíos Marta y Hugo, 2), `sof3m8q` (Sofi), `cam5t1w` (Cami).

## Etapas

- [x] 1. Plantilla de la invitación con datos de prueba
- [x] 2. Netlify Database y confirmaciones reales
- [x] 3. Panel privado (invitaciones, confirmaciones, exportar a Excel)
- [ ] 4. Integración con Spotify
- [ ] 5. Estilo final, fotos del book, dominio y pruebas (estilo victoriano hecho; faltan fotos reales, video, dominio y pruebas)
