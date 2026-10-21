-- Menús especiales por persona: [{ "nombre": "...", "menu": ["sin-tacc", ...], "otra": "..." }]
-- (los ids de menú están en src/config/fiesta.js → FIESTA.menus)
ALTER TABLE confirmaciones ADD COLUMN invitados JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Pasa las confirmaciones existentes al formato nuevo: una persona por nombre,
-- y el texto de restricciones que hubiera queda como "otra" de la primera persona.
UPDATE confirmaciones c SET invitados = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'nombre', n.nombre,
           'menu', '[]'::jsonb,
           'otra', CASE WHEN n.orden = 1 THEN COALESCE(c.restricciones, '') ELSE '' END
         ) ORDER BY n.orden), '[]'::jsonb)
  FROM jsonb_array_elements_text(c.nombres) WITH ORDINALITY AS n(nombre, orden)
)
WHERE c.asiste AND jsonb_array_length(c.nombres) > 0;
