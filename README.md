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

## Dónde se cambia cada cosa

| Archivo | Qué contiene |
|---|---|
| `src/config/fiesta.js` | Datos de la fiesta: fecha, salón, dress code, fecha límite, canciones por invitado |
| `src/theme/theme.css` | Colores, tipografías y bordes de toda la invitación |
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
- [ ] 3. Panel privado (invitaciones, confirmaciones, exportar a Excel)
- [ ] 4. Integración con Spotify
- [ ] 5. Estilo final, fotos del book, dominio y pruebas
