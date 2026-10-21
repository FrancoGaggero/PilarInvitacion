import { useCallback, useEffect, useMemo, useState } from "react";
import { FIESTA } from "../config/fiesta";
import {
  leerToken, guardarToken, ingresar, obtenerDatos,
  crearInvitaciones, editarInvitacion, borrarInvitacion, borrarCancion, registrarEnvio,
} from "./apiPanel";
import {
  linkInvitacion, linkWhatsApp, linkRecordatorio, estadoDe, parsearLista, descargarCSV, fechaCorta,
} from "./utilPanel";

const ETIQUETA_ESTADO = { confirmada: "Confirmó", "no-asiste": "No va", esperando: "Esperando respuesta", "sin-enviar": "Sin enviar" };
const COLOR_ESTADO = {
  confirmada: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "no-asiste": "bg-red-50 text-red-700 ring-red-600/20",
  esperando: "bg-amber-50 text-amber-800 ring-amber-600/20",
  "sin-enviar": "bg-gray-100 text-gray-600 ring-gray-500/20",
};
const PUNTO_ESTADO = { confirmada: "bg-emerald-500", "no-asiste": "bg-red-500", esperando: "bg-amber-500", "sin-enviar": "bg-gray-400" };

export default function Panel() {
  const [logueado, setLogueado] = useState(Boolean(leerToken()));
  return (
    <div className="min-h-svh bg-fondo text-texto">
      {logueado ? (
        <Tablero onSalir={() => { guardarToken(null); setLogueado(false); }} />
      ) : (
        <Ingreso onListo={() => setLogueado(true)} />
      )}
    </div>
  );
}

function Ingreso({ onListo }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError(""); setCargando(true);
    try { await ingresar(password); onListo(); }
    catch (err) { setError(err.message); }
    finally { setCargando(false); }
  };

  return (
    <div className="min-h-svh grid place-items-center px-5">
      <form onSubmit={enviar} className="p-card w-full max-w-sm p-7 grid gap-4">
        <div>
          <h1 className="text-xl font-semibold m-0">Panel de invitados</h1>
          <p className="text-sm text-suave m-0 mt-1">Los 15 de {FIESTA.nombre}</p>
        </div>
        <div>
          <label className="p-label" htmlFor="pw">Contraseña</label>
          <input id="pw" type="password" className="p-input" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </div>
        <button className="p-btn w-full py-2.5" disabled={cargando || !password}>
          {cargando ? "Ingresando…" : "Ingresar"}
        </button>
        {error && <p className="text-alerta text-sm m-0" role="alert">{error}</p>}
      </form>
    </div>
  );
}

function Tablero({ onSalir }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [pestana, setPestana] = useState("invitaciones");

  const cargar = useCallback(async () => {
    try { setDatos(await obtenerDatos()); setError(""); }
    catch (e) { if (e.status === 401) onSalir(); else setError(e.message); }
  }, [onSalir]);

  useEffect(() => { cargar(); }, [cargar]);

  if (!datos) {
    return <div className="min-h-svh grid place-items-center text-suave text-sm">{error || "Cargando…"}</div>;
  }

  return (
    <>
      <header className="bg-fondo-2 border-b border-linea">
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid place-items-center w-7 h-7 rounded-md bg-acento text-white text-sm font-semibold">{FIESTA.nombre[0]}</span>
            <p className="m-0 font-semibold truncate">Los 15 de {FIESTA.nombre}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-btn-sec" onClick={cargar}>Actualizar</button>
            <button className="p-btn-sec" onClick={onSalir}>Salir</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <Resumen invitaciones={datos.invitaciones} canciones={datos.canciones} />

        <nav className="inline-flex gap-1 p-1 mt-8 mb-5 rounded-campo bg-gray-200/70" role="tablist">
          {[["invitaciones", `Invitaciones (${datos.invitaciones.length})`], ["canciones", `Canciones (${datos.canciones.length})`]].map(([id, t]) => (
            <button key={id} role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}
              className={`border-0 rounded-md px-3.5 py-1.5 text-sm font-medium cursor-pointer transition ${
                pestana === id ? "bg-fondo-2 text-texto shadow-sm" : "bg-transparent text-suave hover:text-texto"
              }`}>
              {t}
            </button>
          ))}
        </nav>

        {error && <p className="text-alerta text-sm">{error}</p>}
        {pestana === "invitaciones"
          ? <Invitaciones invitaciones={datos.invitaciones} onCambio={cargar} onError={setError} />
          : <Canciones canciones={datos.canciones} onCambio={cargar} onError={setError} />}
      </main>
    </>
  );
}

function Resumen({ invitaciones, canciones }) {
  const r = useMemo(() => {
    const confirmadas = invitaciones.filter((i) => i.asiste === true);
    return {
      invitaciones: invitaciones.length,
      lugares: invitaciones.reduce((s, i) => s + i.cupo, 0),
      personas: confirmadas.reduce((s, i) => s + (i.cantidad || 0), 0),
      noVan: invitaciones.filter((i) => i.asiste === false).length,
      sinEnviar: invitaciones.filter((i) => estadoDe(i) === "sin-enviar").length,
      esperando: invitaciones.filter((i) => estadoDe(i) === "esperando").length,
      restricciones: confirmadas.filter((i) => i.restricciones).length,
      canciones: canciones.length,
    };
  }, [invitaciones, canciones]);

  const tarjetas = [
    ["Personas confirmadas", r.personas, `de ${r.lugares} lugares asignados`, "confirmada"],
    ["Sin enviar", r.sinEnviar, `de ${r.invitaciones} invitaciones`, "sin-enviar"],
    ["Esperando respuesta", r.esperando, "enviadas sin confirmar", "esperando"],
    ["No van", r.noVan, r.noVan === 1 ? "invitación" : "invitaciones", "no-asiste"],
    ["Restricciones alimentarias", r.restricciones, "invitaciones con aviso", null],
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {tarjetas.map(([titulo, valor, detalle, estado]) => (
        <div key={titulo} className="p-card p-4">
          <p className="text-xs font-medium text-suave m-0 flex items-center gap-1.5">
            {estado && <span className={`w-1.5 h-1.5 rounded-full ${PUNTO_ESTADO[estado]}`} />}
            {titulo}
          </p>
          <p className="text-3xl font-semibold tabular-nums m-0 mt-2">{valor}</p>
          <p className="text-xs text-suave m-0 mt-1">{detalle}</p>
        </div>
      ))}
    </div>
  );
}

function Invitaciones({ invitaciones, onCambio, onError }) {
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [agregando, setAgregando] = useState(invitaciones.length === 0);

  const visibles = invitaciones.filter((i) =>
    (filtro === "todas" || estadoDe(i) === filtro) &&
    i.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  const exportar = () => {
    descargarCSV(`invitados-15-${FIESTA.nombre.toLowerCase()}.csv`, [
      ["Invitación", "Tipo", "Lugares", "Estado", "Enviada", "Recordatorio", "Van", "Nombres", "Restricciones", "Mensaje", "Link"],
      ...invitaciones.map((i) => [
        i.nombre, i.tipo, i.cupo, ETIQUETA_ESTADO[estadoDe(i)],
        i.enviada ? fechaCorta(i.enviada) : "", i.recordatorio ? fechaCorta(i.recordatorio) : "",
        i.asiste ? i.cantidad : 0,
        (i.nombres || []).join(", "), i.restricciones || "", i.mensaje || "", linkInvitacion(i.codigo),
      ]),
    ]);
  };

  return (
    <section>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input className="p-input w-full sm:w-64" placeholder="Buscar por nombre" value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar invitación" />
        <select className="p-input w-auto" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por estado">
          <option value="todas">Todos los estados</option>
          <option value="sin-enviar">Sin enviar</option>
          <option value="esperando">Esperando respuesta</option>
          <option value="confirmada">Confirmaron</option>
          <option value="no-asiste">No van</option>
        </select>
        <div className="flex gap-2 ml-auto">
          <button className="p-btn-sec py-2" onClick={exportar}>Exportar a Excel</button>
          <button className="p-btn" onClick={() => setAgregando((v) => !v)}>
            {agregando ? "Cerrar" : "+ Agregar invitaciones"}
          </button>
        </div>
      </div>

      {agregando && <AgregarInvitaciones onListo={() => { setAgregando(false); onCambio(); }} onError={onError} />}

      {visibles.length === 0 ? (
        <div className="p-card p-10 text-center text-sm text-suave">No hay invitaciones para mostrar.</div>
      ) : (
        <div className="p-card overflow-hidden">
          {/* encabezado de tabla (solo escritorio) */}
          <div className="hidden md:grid grid-cols-[minmax(0,2.4fr)_5rem_10rem_8rem_minmax(0,2fr)] gap-4 px-4 py-2.5 bg-fondo border-b border-linea text-xs font-medium text-suave uppercase tracking-wide">
            <span>Invitación</span><span>Lugares</span><span>Estado</span><span>Enviada</span><span className="text-right">Acciones</span>
          </div>
          <ul className="list-none m-0 p-0 divide-y divide-[color:var(--c-linea)]">
            {visibles.map((i) => <FilaInvitacion key={i.codigo} inv={i} onCambio={onCambio} onError={onError} />)}
          </ul>
        </div>
      )}
    </section>
  );
}

function AgregarInvitaciones({ onListo, onError }) {
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const items = parsearLista(texto);

  const guardar = async () => {
    setGuardando(true);
    try { await crearInvitaciones(items); setTexto(""); onListo(); }
    catch (e) { onError(e.message); }
    finally { setGuardando(false); }
  };

  return (
    <div className="p-card p-5 mb-4 grid gap-3">
      <label className="p-label mb-0" htmlFor="lista">Agregar invitaciones</label>
      <p className="text-sm text-suave m-0 -mt-1">
        Una por línea. Para familias, poné una coma y la cantidad de lugares. Sin número, es una invitación personal.
      </p>
      <textarea id="lista" rows={6} className="p-input font-mono" value={texto} onChange={(e) => setTexto(e.target.value)}
        placeholder={"Familia Pérez, 3\nTíos Ana y Carlos, 2\nSofi\nMili"} />
      <div className="flex flex-wrap items-center gap-3">
        <button className="p-btn" disabled={!items.length || guardando} onClick={guardar}>
          {guardando ? "Guardando…" : `Crear ${items.length || ""} ${items.length === 1 ? "invitación" : "invitaciones"}`}
        </button>
        {items.length > 0 && (
          <span className="text-sm text-suave">
            {items.filter((i) => i.cupo > 1).length} familias, {items.filter((i) => i.cupo === 1).length} personales,{" "}
            {items.reduce((s, i) => s + i.cupo, 0)} lugares
          </span>
        )}
      </div>
    </div>
  );
}

function FilaInvitacion({ inv, onCambio, onError }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(inv.nombre);
  const [cupo, setCupo] = useState(inv.cupo);
  const [copiado, setCopiado] = useState(false);
  const estado = estadoDe(inv);

  const copiar = async () => {
    try { await navigator.clipboard.writeText(linkInvitacion(inv.codigo)); setCopiado(true); setTimeout(() => setCopiado(false), 1500); }
    catch { window.prompt("Copiá el link:", linkInvitacion(inv.codigo)); }
  };
  const guardar = async () => {
    try { await editarInvitacion(inv.codigo, nombre, Number(cupo)); setEditando(false); onCambio(); }
    catch (e) { onError(e.message); }
  };
  // El link de WhatsApp se abre normalmente; el registro del envío se hace en segundo plano
  const registrar = (tipo) => registrarEnvio(inv.codigo, tipo).then(onCambio).catch((e) => onError(e.message));
  const borrar = async () => {
    if (!window.confirm(`¿Borrar la invitación de ${inv.nombre}? También se borran su confirmación y sus canciones.`)) return;
    try { await borrarInvitacion(inv.codigo); onCambio(); }
    catch (e) { onError(e.message); }
  };

  if (editando) {
    return (
      <li className="px-4 py-3 flex flex-wrap gap-2 items-center bg-fondo">
        <input className="p-input w-full sm:w-64" value={nombre} onChange={(e) => setNombre(e.target.value)} aria-label="Nombre" />
        <input className="p-input w-20" type="number" min={1} max={20} value={cupo} onChange={(e) => setCupo(e.target.value)} aria-label="Lugares" />
        <button className="p-btn" onClick={guardar}>Guardar</button>
        <button className="p-btn-sec py-2" onClick={() => setEditando(false)}>Cancelar</button>
      </li>
    );
  }

  return (
    <li className="px-4 py-3.5 grid gap-3 md:grid-cols-[minmax(0,2.4fr)_5rem_10rem_8rem_minmax(0,2fr)] md:gap-4 md:items-center hover:bg-gray-50">
      {/* Invitación */}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="m-0 font-medium truncate">{inv.nombre}</p>
          <span className={`p-chip md:hidden ${COLOR_ESTADO[estado]}`}>{ETIQUETA_ESTADO[estado]}</span>
        </div>
        <p className="text-xs text-suave m-0 mt-0.5 md:hidden">
          {inv.cupo === 1 ? "Personal" : `${inv.cupo} lugares`}
          {inv.enviada && ` · enviada el ${fechaCorta(inv.enviada)}`}
        </p>
        {inv.asiste === true && inv.tipo === "familia" && (
          <p className="text-xs text-suave m-0 mt-1">Van {inv.cantidad}: {(inv.nombres || []).join(", ")}</p>
        )}
        {inv.restricciones && <p className="text-xs m-0 mt-1">🍽️ {inv.restricciones}</p>}
        {inv.mensaje && <p className="text-xs text-suave italic m-0 mt-1">“{inv.mensaje}”</p>}
      </div>

      {/* Columnas de escritorio */}
      <span className="hidden md:block text-sm tabular-nums">{inv.cupo === 1 ? "Personal" : inv.cupo}</span>
      <span className="hidden md:block"><span className={`p-chip ${COLOR_ESTADO[estado]}`}>{ETIQUETA_ESTADO[estado]}</span></span>
      <span className="hidden md:block text-sm text-suave">
        {inv.enviada ? fechaCorta(inv.enviada) : "—"}
        {inv.recordatorio && <span className="block text-xs">Rec. {fechaCorta(inv.recordatorio)}</span>}
      </span>

      {/* Acciones */}
      <div className="flex flex-wrap gap-1.5 md:justify-end">
        {estado === "sin-enviar" && (
          <a className="p-btn py-1.5" href={linkWhatsApp(inv)} target="_blank" rel="noopener" onClick={() => registrar("invitacion")}>
            Enviar WhatsApp
          </a>
        )}
        {estado === "esperando" && (
          <a className="p-btn-sec" href={linkRecordatorio(inv)} target="_blank" rel="noopener" onClick={() => registrar("recordatorio")}>
            Recordatorio
          </a>
        )}
        <button className="p-btn-sec" onClick={copiar}>{copiado ? "¡Copiado!" : "Copiar link"}</button>
        <details className="relative">
          <summary className="p-btn-sec list-none [&::-webkit-details-marker]:hidden" aria-label="Más acciones">···</summary>
          <div className="p-card absolute right-0 z-10 mt-1 w-48 py-1 grid text-sm">
            <a className="px-3 py-2 text-texto no-underline hover:bg-fondo" href={`/i/${inv.codigo}`} target="_blank" rel="noopener">Ver invitación</a>
            {(estado === "confirmada" || estado === "no-asiste") && (
              <a className="px-3 py-2 text-texto no-underline hover:bg-fondo" href={linkWhatsApp(inv)} target="_blank" rel="noopener">Reenviar link</a>
            )}
            {estado === "sin-enviar" && (
              <button className="text-left px-3 py-2 bg-transparent border-0 cursor-pointer text-texto hover:bg-fondo" onClick={() => registrar("invitacion")}>Marcar como enviada</button>
            )}
            {estado === "esperando" && (
              <button className="text-left px-3 py-2 bg-transparent border-0 cursor-pointer text-texto hover:bg-fondo" onClick={() => registrar("desmarcar")}>Desmarcar envío</button>
            )}
            <button className="text-left px-3 py-2 bg-transparent border-0 cursor-pointer text-texto hover:bg-fondo" onClick={() => setEditando(true)}>Editar</button>
            <button className="text-left px-3 py-2 bg-transparent border-0 cursor-pointer text-alerta hover:bg-red-50" onClick={borrar}>Borrar</button>
          </div>
        </details>
      </div>
    </li>
  );
}

function Canciones({ canciones, onCambio, onError }) {
  const borrar = async (c) => {
    if (!window.confirm(`¿Quitar "${c.titulo}"?`)) return;
    try { await borrarCancion(c.id); onCambio(); }
    catch (e) { onError(e.message); }
  };
  const exportar = () =>
    descargarCSV(`canciones-15-${FIESTA.nombre.toLowerCase()}.csv`, [
      ["Canción", "Artista", "Sugerida por"],
      ...canciones.map((c) => [c.titulo, c.artista, c.sugerida_por]),
    ]);

  return (
    <section>
      <div className="flex justify-end mb-4">
        <button className="p-btn-sec py-2" onClick={exportar} disabled={!canciones.length}>Exportar a Excel</button>
      </div>
      {canciones.length === 0 ? (
        <div className="p-card p-10 text-center text-sm text-suave">Todavía nadie sugirió canciones.</div>
      ) : (
        <ul className="p-card list-none m-0 p-0 divide-y divide-[color:var(--c-linea)] overflow-hidden">
          {canciones.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="m-0 font-medium truncate">{c.titulo} <span className="font-normal text-suave">· {c.artista}</span></p>
                <p className="text-xs text-suave m-0 mt-0.5">Sugerida por {c.sugerida_por}</p>
              </div>
              <button className="p-btn-sec text-alerta shrink-0" onClick={() => borrar(c)}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
