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
  confirmada: "text-destacado border-destacado/50",
  "no-asiste": "text-alerta border-alerta/50",
  esperando: "text-acento border-acento/50",
  "sin-enviar": "text-suave border-linea",
};

export default function Panel() {
  const [logueado, setLogueado] = useState(Boolean(leerToken()));
  return (
    <div className="min-h-svh">
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
    <div className="min-h-svh grid place-items-center px-6">
      <form onSubmit={enviar} className="w-full max-w-sm grid gap-4">
        <p className="font-titulos text-5xl text-center m-0">Panel</p>
        <p className="text-suave text-center m-0 mb-2">Los 15 de {FIESTA.nombre}</p>
        <label className="etiqueta mb-0" htmlFor="pw">Contraseña</label>
        <input id="pw" type="password" className="campo" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        <button className="btn-primario" disabled={cargando || !password}>
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
    return <div className="min-h-svh grid place-items-center text-suave">{error || "Cargando…"}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-suave text-sm m-0">Panel privado</p>
          <h1 className="font-titulos text-4xl m-0">Los 15 de {FIESTA.nombre}</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn-borde cursor-pointer bg-transparent text-sm py-2" onClick={cargar}>Actualizar</button>
          <button className="btn-borde cursor-pointer bg-transparent text-sm py-2" onClick={onSalir}>Salir</button>
        </div>
      </header>

      <Resumen invitaciones={datos.invitaciones} canciones={datos.canciones} />

      <nav className="flex gap-2 border-b border-linea mt-10 mb-6" role="tablist">
        {[["invitaciones", "Invitaciones"], ["canciones", `Canciones (${datos.canciones.length})`]].map(([id, t]) => (
          <button key={id} role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}
            className={`bg-transparent border-0 border-b-2 px-3 py-2.5 cursor-pointer text-texto ${pestana === id ? "border-acento" : "border-transparent text-suave"}`}>
            {t}
          </button>
        ))}
      </nav>

      {error && <p className="text-alerta text-sm">{error}</p>}
      {pestana === "invitaciones"
        ? <Invitaciones invitaciones={datos.invitaciones} onCambio={cargar} onError={setError} />
        : <Canciones canciones={datos.canciones} onCambio={cargar} onError={setError} />}
    </div>
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
    ["Personas confirmadas", r.personas, `de ${r.lugares} lugares asignados`],
    ["Sin enviar", r.sinEnviar, `de ${r.invitaciones} invitaciones`],
    ["Esperando respuesta", r.esperando, "enviadas sin confirmar"],
    ["No van", r.noVan, r.noVan === 1 ? "invitación" : "invitaciones"],
    ["Restricciones alimentarias", r.restricciones, "invitaciones con aviso"],
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {tarjetas.map(([titulo, valor, detalle]) => (
        <div key={titulo} className="border border-linea rounded-campo p-4">
          <p className="text-sm text-suave m-0">{titulo}</p>
          <p className="font-titulos text-4xl text-destacado m-0 mt-1">{valor}</p>
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
        <input className="campo max-w-xs py-2" placeholder="Buscar por nombre" value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar invitación" />
        <select className="campo w-auto py-2" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por estado">
          <option className="text-black" value="todas">Todas</option>
          <option className="text-black" value="sin-enviar">Sin enviar</option>
          <option className="text-black" value="esperando">Esperando respuesta</option>
          <option className="text-black" value="confirmada">Confirmaron</option>
          <option className="text-black" value="no-asiste">No van</option>
        </select>
        <div className="flex gap-2 ml-auto">
          <button className="btn-borde cursor-pointer bg-transparent text-sm py-2" onClick={exportar}>Exportar a Excel</button>
          <button className="btn-primario text-sm py-2" onClick={() => setAgregando((v) => !v)}>
            {agregando ? "Cerrar" : "+ Agregar invitaciones"}
          </button>
        </div>
      </div>

      {agregando && <AgregarInvitaciones onListo={() => { setAgregando(false); onCambio(); }} onError={onError} />}

      {visibles.length === 0 ? (
        <p className="text-suave">No hay invitaciones para mostrar.</p>
      ) : (
        <ul className="list-none m-0 p-0 grid gap-2">
          {visibles.map((i) => <FilaInvitacion key={i.codigo} inv={i} onCambio={onCambio} onError={onError} />)}
        </ul>
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
    <div className="border border-linea rounded-campo p-5 mb-6 grid gap-3">
      <label className="etiqueta mb-0" htmlFor="lista">
        Una invitación por línea. Para familias, poné una coma y la cantidad de lugares. Sin número, es una invitación personal.
      </label>
      <textarea id="lista" rows={6} className="campo font-mono text-sm" value={texto} onChange={(e) => setTexto(e.target.value)}
        placeholder={"Familia Pérez, 3\nTíos Ana y Carlos, 2\nSofi\nMili"} />
      <div className="flex items-center gap-3">
        <button className="btn-primario text-sm py-2" disabled={!items.length || guardando} onClick={guardar}>
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

  return (
    <li className="border border-linea rounded-campo p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {editando ? (
          <div className="flex flex-wrap gap-2 items-center">
            <input className="campo py-1.5 w-56" value={nombre} onChange={(e) => setNombre(e.target.value)} aria-label="Nombre" />
            <input className="campo py-1.5 w-20" type="number" min={1} max={20} value={cupo} onChange={(e) => setCupo(e.target.value)} aria-label="Lugares" />
            <button className="btn-primario text-sm py-1.5" onClick={guardar}>Guardar</button>
            <button className="bg-transparent border-0 text-suave cursor-pointer" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        ) : (
          <div>
            <p className="m-0">
              {inv.nombre}{" "}
              <span className="text-sm text-suave">· {inv.cupo === 1 ? "personal" : `${inv.cupo} lugares`}</span>
            </p>
            {inv.asiste === true && inv.tipo === "familia" && (
              <p className="text-sm text-suave m-0 mt-1">Van {inv.cantidad}: {(inv.nombres || []).join(", ")}</p>
            )}
            {inv.restricciones && <p className="text-sm m-0 mt-1">🍽️ {inv.restricciones}</p>}
            {inv.mensaje && <p className="text-sm text-suave italic m-0 mt-1">“{inv.mensaje}”</p>}
            {inv.enviada && (
              <p className="text-xs text-suave m-0 mt-1">
                Enviada el {fechaCorta(inv.enviada)}
                {inv.recordatorio && ` · recordatorio el ${fechaCorta(inv.recordatorio)}`}
              </p>
            )}
          </div>
        )}
        <span className={`text-xs border rounded-boton px-2.5 py-1 shrink-0 ${COLOR_ESTADO[estado]}`}>{ETIQUETA_ESTADO[estado]}</span>
      </div>
      {!editando && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
          {estado === "sin-enviar" && (
            <a className="text-acento" href={linkWhatsApp(inv)} target="_blank" rel="noopener" onClick={() => registrar("invitacion")}>
              Enviar por WhatsApp
            </a>
          )}
          {estado === "esperando" && (
            <a className="text-acento" href={linkRecordatorio(inv)} target="_blank" rel="noopener" onClick={() => registrar("recordatorio")}>
              Enviar recordatorio
            </a>
          )}
          {(estado === "confirmada" || estado === "no-asiste") && (
            <a className="text-acento" href={linkWhatsApp(inv)} target="_blank" rel="noopener">Reenviar link</a>
          )}
          <button className="bg-transparent border-0 p-0 text-acento cursor-pointer" onClick={copiar}>{copiado ? "¡Copiado!" : "Copiar link"}</button>
          <a className="text-acento" href={`/i/${inv.codigo}`} target="_blank" rel="noopener">Ver</a>
          {estado === "sin-enviar" ? (
            <button className="bg-transparent border-0 p-0 text-acento cursor-pointer" onClick={() => registrar("invitacion")}>Marcar como enviada</button>
          ) : estado === "esperando" && (
            <button className="bg-transparent border-0 p-0 text-suave cursor-pointer" onClick={() => registrar("desmarcar")}>Desmarcar envío</button>
          )}
          <button className="bg-transparent border-0 p-0 text-acento cursor-pointer" onClick={() => setEditando(true)}>Editar</button>
          <button className="bg-transparent border-0 p-0 text-alerta cursor-pointer" onClick={borrar}>Borrar</button>
        </div>
      )}
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
        <button className="btn-borde cursor-pointer bg-transparent text-sm py-2" onClick={exportar} disabled={!canciones.length}>
          Exportar a Excel
        </button>
      </div>
      {canciones.length === 0 ? (
        <p className="text-suave">Todavía nadie sugirió canciones.</p>
      ) : (
        <ul className="list-none m-0 p-0 grid gap-2">
          {canciones.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 border border-linea rounded-campo px-4 py-3">
              <div className="min-w-0">
                <p className="m-0 truncate">{c.titulo} <span className="text-suave">· {c.artista}</span></p>
                <p className="text-sm text-suave m-0">Sugerida por {c.sugerida_por}</p>
              </div>
              <button className="bg-transparent border-0 text-alerta cursor-pointer text-sm shrink-0" onClick={() => borrar(c)}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
