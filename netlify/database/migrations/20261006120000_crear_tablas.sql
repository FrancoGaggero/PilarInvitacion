-- Invitaciones: una por familia o por amiga
CREATE TABLE invitaciones (
  codigo      TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN ('familia', 'personal')),
  cupo        INTEGER NOT NULL CHECK (cupo BETWEEN 1 AND 20),
  creada      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Una confirmación por invitación (se puede actualizar hasta la fecha límite)
CREATE TABLE confirmaciones (
  codigo         TEXT PRIMARY KEY REFERENCES invitaciones(codigo) ON DELETE CASCADE,
  asiste         BOOLEAN NOT NULL,
  cantidad       INTEGER NOT NULL DEFAULT 0,
  nombres        JSONB NOT NULL DEFAULT '[]'::jsonb,
  restricciones  TEXT,
  mensaje        TEXT,
  actualizada    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Canciones sugeridas (spotify_id único: no se repiten en la playlist)
CREATE TABLE canciones (
  id           SERIAL PRIMARY KEY,
  codigo       TEXT NOT NULL REFERENCES invitaciones(codigo) ON DELETE CASCADE,
  spotify_id   TEXT NOT NULL UNIQUE,
  titulo       TEXT NOT NULL,
  artista      TEXT NOT NULL,
  imagen       TEXT,
  creada       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX canciones_codigo_idx ON canciones (codigo);

-- Configuración general (permiso de Spotify, etc.)
CREATE TABLE configuracion (
  clave   TEXT PRIMARY KEY,
  valor   JSONB NOT NULL
);
