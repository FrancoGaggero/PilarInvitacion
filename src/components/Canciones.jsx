import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FIESTA } from "../config/fiesta";
import { buscarCanciones, sugerirCancion, quitarCancion } from "../lib/api";

export default function Canciones({ invitacion }) {
  const max = FIESTA.canciones.maxPorInvitacion;
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mias, setMias] = useState(invitacion.canciones ?? []);
  const [error, setError] = useState("");
  const [agregando, setAgregando] = useState(null);
  const ultimaBusqueda = useRef(0);

  // Espera a que el invitado deje de escribir antes de buscar (cuida el límite de Spotify)
  useEffect(() => {
    if (texto.trim().length < 2) { setResultados([]); setBuscando(false); return; }
    setBuscando(true);
    const id = ++ultimaBusqueda.current;
    const t = setTimeout(async () => {
      try {
        const r = await buscarCanciones(texto);
        if (id === ultimaBusqueda.current) setResultados(r);
      } catch {
        if (id === ultimaBusqueda.current) setResultados([]);
      } finally {
        if (id === ultimaBusqueda.current) setBuscando(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [texto]);

  const agregar = async (c) => {
    setError(""); setAgregando(c.id);
    try {
      setMias(await sugerirCancion(invitacion.codigo, c));
      setTexto(""); setResultados([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setAgregando(null);
    }
  };

  const quitar = async (id) => {
    setError("");
    try { setMias(await quitarCancion(invitacion.codigo, id)); }
    catch (e) { setError(e.message); }
  };
  const lleno = mias.length >= max;
  const yaEsta = (id) => mias.some((m) => m.id === id);

  return (
    <section id="musica" className="seccion">
      <h2 className="titulo-seccion">Que suene tu tema</h2>
      <p className="text-suave mb-6">
        Buscá las canciones que no pueden faltar en la pista. Van directo a la playlist de la fiesta.
      </p>

      {!lleno ? (
        <div className="relative">
          <label className="etiqueta" htmlFor="buscar">Buscar canción o artista</label>
          <input
            id="buscar"
            className="campo"
            type="search"
            autoComplete="off"
            placeholder="Ej.: Tini, Duki, ABBA…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          {texto.trim().length >= 2 && (
            <div className="mt-2 border border-linea rounded-campo overflow-hidden" aria-live="polite">
              {buscando ? (
                <p className="text-suave text-sm px-4 py-3 m-0">Buscando…</p>
              ) : resultados.length === 0 ? (
                <p className="text-suave text-sm px-4 py-3 m-0">No encontramos esa canción. Probá con otro nombre o con el artista.</p>
              ) : (
                <ul className="list-none m-0 p-0 divide-y divide-linea">
                  {resultados.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="m-0 truncate">{c.titulo}</p>
                        <p className="m-0 text-sm text-suave truncate">{c.artista}</p>
                      </div>
                      <button
                        type="button"
                        disabled={yaEsta(c.id) || agregando === c.id}
                        onClick={() => agregar(c)}
                        className="shrink-0 rounded-boton border border-linea px-4 py-1.5 text-sm text-texto bg-transparent cursor-pointer hover:border-acento disabled:opacity-50 disabled:cursor-default"
                      >
                        {yaEsta(c.id) ? "Agregada" : agregando === c.id ? "Agregando…" : "Agregar"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {error && <p className="text-alerta text-sm mt-2">{error}</p>}
        </div>
      ) : (
        <p className="text-suave">Ya sumaste tus {max} canciones. Si querés cambiar alguna, quitala de la lista.</p>
      )}

      <div className="mt-8">
        <p className="text-sm text-suave mb-3">Tus canciones ({mias.length} de {max})</p>
        {mias.length === 0 ? (
          <p className="text-suave text-sm m-0">Todavía no sumaste ninguna.</p>
        ) : (
          <ul className="list-none m-0 p-0 grid gap-2">
            <AnimatePresence initial={false}>
              {mias.map((c) => (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between gap-4 border border-linea rounded-campo px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="m-0 truncate">{c.titulo}</p>
                    <p className="m-0 text-sm text-suave truncate">{c.artista}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitar(c.id)}
                    aria-label={`Quitar ${c.titulo}`}
                    className="shrink-0 bg-transparent border-0 text-suave text-xl leading-none cursor-pointer px-1 hover:text-alerta"
                  >
                    ×
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  );
}
