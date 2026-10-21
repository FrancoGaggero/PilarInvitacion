import { useCallback, useEffect, useMemo, useState } from "react";
import { FIESTA } from "../config/fiesta";
import {
  leerToken, guardarToken, ingresar, obtenerDatos,
  crearInvitaciones, editarInvitacion, borrarInvitacion, borrarCancion, registrarEnvio, confirmarPorPanel,
} from "./apiPanel";
import {
  linkInvitacion, linkWhatsApp, linkRecordatorio, estadoDe, parsearLista, descargarCSV, fechaCorta,
} from "./utilPanel";
import { MENUS, personasDe, personasIniciales, armarConfirmacion, tieneMenuEspecial, textoMenus } from "../lib/menus";
import Icono from "./Iconos";

const ETIQUETA_ESTADO = { confirmada: "Confirmó", "no-asiste": "No va", esperando: "Esperando respuesta", "sin-enviar": "Sin enviar" };
const COLOR_ESTADO = {
  confirmada: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "no-asiste": "bg-red-50 text-red-700 ring-red-600/20",
  esperando: "bg-amber-50 text-amber-800 ring-amber-600/20",
  "sin-enviar": "bg-gray-100 text-gray-600 ring-gray-500/20",
};
const PUNTO_ESTADO = { confirmada: "bg-emerald-500", "no-asiste": "bg-red-500", esperando: "bg-amber-500", "sin-enviar": "bg-gray-400" };

// Personas que van con menú especial, con la invitación a la que pertenecen
function personasConMenu(invitaciones) {
  return invitaciones
    .filter((i) => i.asiste === true)
    .flatMap((i) => personasDe(i).filter(tieneMenuEspecial).map((p) => ({ ...p, invitacion: i.nombre })));
}

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
        <button className="p-btn w-full" disabled={cargando || !password}>
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

  const conMenu = useMemo(() => personasConMenu(datos?.invitaciones ?? []), [datos]);

  if (!datos) {
    return <div className="min-h-svh grid place-items-center text-suave text-sm">{error || "Cargando…"}</div>;
  }

  const pestanas = [
    ["invitaciones", "Invitaciones", "Invitados", datos.invitaciones.length],
    ["menus", "Menús especiales", "Menús", conMenu.length],
    ["canciones", "Canciones", "Canciones", datos.canciones.length],
  ];

  return (
    <>
      <header className="bg-fondo-2 border-b border-linea sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-acento text-white text-sm font-semibold">{FIESTA.nombre[0]}</span>
            <p className="m-0 font-semibold truncate">Los 15 de {FIESTA.nombre}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-btn-sec" onClick={cargar} title="Actualizar">
              <Icono nombre="actualizar" /><span className="hidden sm:inline">Actualizar</span>
            </button>
            <button className="p-btn-sec" onClick={onSalir} title="Salir">
              <Icono nombre="salir" /><span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <Resumen invitaciones={datos.invitaciones} conMenu={conMenu.length} />

        <nav className="grid grid-cols-3 sm:inline-grid sm:grid-flow-col sm:auto-cols-max gap-1 p-1 mt-8 mb-5 rounded-xl bg-gray-200/70" role="tablist">
          {pestanas.map(([id, t, corto, n]) => (
            <button key={id} role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}
              className={`border-0 rounded-lg px-2 sm:px-4 py-2 text-sm font-medium cursor-pointer transition whitespace-nowrap ${
                pestana === id ? "bg-fondo-2 text-texto shadow-sm" : "bg-transparent text-suave hover:text-texto"
              }`}>
              <span className="sm:hidden">{corto}</span><span className="hidden sm:inline">{t}</span>{" "}
              <span className="text-suave font-normal">{n}</span>
            </button>
          ))}
        </nav>

        {error && <p className="text-alerta text-sm">{error}</p>}
        {pestana === "invitaciones" && <Invitaciones invitaciones={datos.invitaciones} onCambio={cargar} onError={setError} />}
        {pestana === "menus" && <Menus personas={conMenu} />}
        {pestana === "canciones" && <Canciones canciones={datos.canciones} onCambio={cargar} onError={setError} />}
      </main>
    </>
  );
}

function Resumen({ invitaciones, conMenu }) {
  const r = useMemo(() => {
    const confirmadas = invitaciones.filter((i) => i.asiste === true);
    return {
      invitaciones: invitaciones.length,
      lugares: invitaciones.reduce((s, i) => s + i.cupo, 0),
      personas: confirmadas.reduce((s, i) => s + (i.cantidad || 0), 0),
      noVan: invitaciones.filter((i) => i.asiste === false).length,
      sinEnviar: invitaciones.filter((i) => estadoDe(i) === "sin-enviar").length,
      esperando: invitaciones.filter((i) => estadoDe(i) === "esperando").length,
    };
  }, [invitaciones]);

  const tarjetas = [
    ["Personas confirmadas", r.personas, `de ${r.lugares} lugares`, "confirmada"],
    ["Sin enviar", r.sinEnviar, `de ${r.invitaciones} invitaciones`, "sin-enviar"],
    ["Esperando respuesta", r.esperando, "enviadas sin confirmar", "esperando"],
    ["No van", r.noVan, r.noVan === 1 ? "invitación" : "invitaciones", "no-asiste"],
    ["Menús especiales", conMenu, conMenu === 1 ? "persona" : "personas", null],
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {tarjetas.map(([titulo, valor, detalle, estado], i) => (
        <div key={titulo} className={`p-card p-4 min-w-0 ${i === 4 ? "col-span-2 lg:col-span-1" : ""}`}>
          <p className="text-sm font-medium text-suave m-0 flex items-center gap-2 leading-tight">
            {estado ? <span className={`w-2 h-2 rounded-full shrink-0 ${PUNTO_ESTADO[estado]}`} /> : <Icono nombre="cubiertos" className="w-3.5 h-3.5" />}
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
  const [confirmando, setConfirmando] = useState(null);

  const visibles = invitaciones.filter((i) =>
    (filtro === "todas" || estadoDe(i) === filtro) &&
    i.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  const exportar = () => {
    descargarCSV(`invitados-15-${FIESTA.nombre.toLowerCase()}.csv`, [
      ["Invitación", "Tipo", "Lugares", "Estado", "Enviada", "Recordatorio", "Van", "Nombres", "Menús especiales", "Mensaje", "Link"],
      ...invitaciones.map((i) => [
        i.nombre, i.tipo, i.cupo, ETIQUETA_ESTADO[estadoDe(i)],
        i.enviada ? fechaCorta(i.enviada) : "", i.recordatorio ? fechaCorta(i.recordatorio) : "",
        i.asiste ? i.cantidad : 0,
        personasDe(i).map((p) => p.nombre).join(", "),
        personasDe(i).filter(tieneMenuEspecial).map((p) => `${p.nombre}: ${textoMenus(p)}`).join("; "),
        i.mensaje || "", linkInvitacion(i.codigo),
      ]),
    ]);
  };

  return (
    <section>
      <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center mb-4">
        <input className="p-input sm:w-64" placeholder="Buscar por nombre" value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar invitación" />
        <select className="p-input sm:w-auto" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por estado">
          <option value="todas">Todos los estados</option>
          <option value="sin-enviar">Sin enviar</option>
          <option value="esperando">Esperando respuesta</option>
          <option value="confirmada">Confirmaron</option>
          <option value="no-asiste">No van</option>
        </select>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:ml-auto">
          <button className="p-btn-sec" onClick={exportar}><Icono nombre="descargar" />Exportar</button>
          <button className="p-btn" onClick={() => setAgregando((v) => !v)}>
            <Icono nombre={agregando ? "cerrar" : "mas"} />{agregando ? "Cerrar" : "Agregar"}
          </button>
        </div>
      </div>

      {agregando && <AgregarInvitaciones onListo={() => { setAgregando(false); onCambio(); }} onError={onError} />}

      {visibles.length === 0 ? (
        <div className="p-card p-10 text-center text-sm text-suave">No hay invitaciones para mostrar.</div>
      ) : (
        <ul className="list-none m-0 p-0 grid gap-3 lg:grid-cols-2">
          {visibles.map((i) => (
            <TarjetaInvitacion key={i.codigo} inv={i} onCambio={onCambio} onError={onError} onConfirmar={() => setConfirmando(i)} />
          ))}
        </ul>
      )}

      {confirmando && (
        <ConfirmarPorEllos
          inv={confirmando}
          onCerrar={() => setConfirmando(null)}
          onListo={() => { setConfirmando(null); onCambio(); }}
        />
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

function TarjetaInvitacion({ inv, onCambio, onError, onConfirmar }) {
  const [editando, setEditando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const estado = estadoDe(inv);
  const personas = inv.asiste === true ? personasDe(inv) : [];
  const conMenu = personas.filter(tieneMenuEspecial);

  const copiar = async () => {
    try { await navigator.clipboard.writeText(linkInvitacion(inv.codigo)); setCopiado(true); setTimeout(() => setCopiado(false), 1500); }
    catch { window.prompt("Copiá el link:", linkInvitacion(inv.codigo)); }
  };
  // El link de WhatsApp se abre normalmente; el registro del envío se hace en segundo plano
  const registrar = (tipo) => registrarEnvio(inv.codigo, tipo).then(onCambio).catch((e) => onError(e.message));

  return (
    <li className="p-card p-4 sm:p-5 flex flex-col gap-3 min-w-0">
      {/* Encabezado: nombre + estado */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 font-semibold text-base break-words">{inv.nombre}</p>
          <p className="text-sm text-suave m-0 mt-0.5">
            {inv.cupo === 1 ? "Personal" : `${inv.cupo} lugares`}
            {inv.enviada && ` · enviada el ${fechaCorta(inv.enviada)}`}
            {inv.recordatorio && ` · recordatorio el ${fechaCorta(inv.recordatorio)}`}
          </p>
        </div>
        <span className={`p-chip shrink-0 ${COLOR_ESTADO[estado]}`}>{ETIQUETA_ESTADO[estado]}</span>
      </div>

      {/* Detalle de la confirmación */}
      {(personas.length > 0 || inv.mensaje) && (
        <div className="grid gap-1.5 text-sm">
          {inv.tipo === "familia" && personas.length > 0 && (
            <p className="m-0"><span className="text-suave">Van {inv.cantidad}:</span> {personas.map((p) => p.nombre).join(", ")}</p>
          )}
          {conMenu.map((p, k) => (
            <p key={k} className="m-0 flex items-start gap-1.5">
              <Icono nombre="cubiertos" className="w-4 h-4 mt-0.5 text-orange-600" />
              <span>{inv.tipo === "familia" && <b className="font-medium">{p.nombre}: </b>}{textoMenus(p)}</span>
            </p>
          ))}
          {inv.mensaje && <p className="m-0 italic text-suave">“{inv.mensaje}”</p>}
        </div>
      )}

      {editando ? (
        <EditarInvitacion inv={inv} estado={estado} registrar={registrar} onCambio={onCambio} onError={onError} onCerrar={() => setEditando(false)} />
      ) : (
        <div className="grid grid-cols-2 gap-2 pt-3 mt-auto border-t border-linea sm:flex sm:flex-wrap">
          {estado === "sin-enviar" && (
            <a className="p-btn-wa col-span-2" href={linkWhatsApp(inv)} target="_blank" rel="noopener" onClick={() => registrar("invitacion")}>
              <Icono nombre="whatsapp" />Enviar por WhatsApp
            </a>
          )}
          {estado === "esperando" && (
            <a className="p-btn-aviso col-span-2" href={linkRecordatorio(inv)} target="_blank" rel="noopener" onClick={() => registrar("recordatorio")}>
              <Icono nombre="campana" />Recordatorio
            </a>
          )}
          <button className="p-btn-link" onClick={copiar}>
            <Icono nombre={copiado ? "check" : "enlace"} />{copiado ? "¡Copiado!" : "Copiar link"}
          </button>
          <button className="p-btn-ok" onClick={onConfirmar}>
            <Icono nombre="confirmar" />{inv.asiste == null ? "Confirmar" : "Cambiar"}
          </button>
          <a className="p-btn-sec" href={`/i/${inv.codigo}`} target="_blank" rel="noopener" title="Ver invitación">
            <Icono nombre="ojo" />Ver
          </a>
          <button className="p-btn-sec" onClick={() => setEditando(true)} title="Editar">
            <Icono nombre="lapiz" />Editar
          </button>
        </div>
      )}
    </li>
  );
}

// Edición: nombre y lugares, estado del envío y borrar (las acciones poco frecuentes)
function EditarInvitacion({ inv, estado, registrar, onCambio, onError, onCerrar }) {
  const [nombre, setNombre] = useState(inv.nombre);
  const [cupo, setCupo] = useState(inv.cupo);

  const guardar = async () => {
    try { await editarInvitacion(inv.codigo, nombre, Number(cupo)); onCerrar(); onCambio(); }
    catch (e) { onError(e.message); }
  };
  const borrar = async () => {
    if (!window.confirm(`¿Borrar la invitación de ${inv.nombre}? También se borran su confirmación y sus canciones.`)) return;
    try { await borrarInvitacion(inv.codigo); onCambio(); }
    catch (e) { onError(e.message); }
  };

  return (
    <div className="grid gap-3 pt-3 border-t border-linea">
      <div className="grid grid-cols-[1fr_6rem] gap-2">
        <div>
          <label className="p-label" htmlFor={`n-${inv.codigo}`}>Nombre</label>
          <input id={`n-${inv.codigo}`} className="p-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label className="p-label" htmlFor={`c-${inv.codigo}`}>Lugares</label>
          <input id={`c-${inv.codigo}`} className="p-input" type="number" min={1} max={20} value={cupo} onChange={(e) => setCupo(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="p-btn" onClick={guardar}><Icono nombre="check" />Guardar</button>
        <button className="p-btn-sec" onClick={onCerrar}>Cancelar</button>
        {estado === "sin-enviar" && (
          <button className="p-btn-sec" onClick={() => registrar("invitacion")}><Icono nombre="enviado" />Marcar como enviada</button>
        )}
        {estado === "esperando" && (
          <button className="p-btn-sec" onClick={() => registrar("desmarcar")}>Desmarcar envío</button>
        )}
        <button className="p-btn-peligro sm:ml-auto" onClick={borrar}><Icono nombre="papelera" />Borrar</button>
      </div>
    </div>
  );
}

// Cargar la confirmación por teléfono: asistencia, nombres y menú de cada persona
function ConfirmarPorEllos({ inv, onCerrar, onListo }) {
  const familia = inv.tipo === "familia";
  const [asiste, setAsiste] = useState(inv.asiste === false ? "no" : "si");
  const [cantidad, setCantidad] = useState(inv.cantidad || inv.cupo);
  const [personas, setPersonas] = useState(() => personasIniciales(inv, inv.cupo));
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cambiar = (i, campo, valor) =>
    setPersonas((ps) => ps.map((p, k) => (k === i ? { ...p, [campo]: valor } : p)));
  const alternarMenu = (i, id) =>
    cambiar(i, "menu", personas[i].menu.includes(id) ? personas[i].menu.filter((m) => m !== id) : [...personas[i].menu, id]);

  const guardar = async (e) => {
    e.preventDefault();
    setError(""); setGuardando(true);
    try {
      await confirmarPorPanel(inv.codigo, armarConfirmacion({ asiste, cantidad, invitados: personas, mensaje: inv.mensaje }, inv));
      onListo();
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  };

  const n = familia ? Number(cantidad) : 1;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/40 p-0 sm:p-6" onClick={onCerrar}>
      <form
        onSubmit={guardar}
        onClick={(e) => e.stopPropagation()}
        className="bg-fondo-2 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6 grid gap-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold m-0">Confirmar por {inv.nombre}</h2>
            <p className="text-sm text-suave m-0 mt-0.5">Para quien te confirmó por teléfono o mensaje.</p>
          </div>
          <button type="button" className="p-btn-sec px-2.5" onClick={onCerrar} aria-label="Cerrar"><Icono nombre="cerrar" /></button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[["si", "Sí, va", "bg-emerald-600 border-emerald-600 text-white"], ["no", "No va", "bg-red-600 border-red-600 text-white"]].map(([v, t, activo]) => (
            <button key={v} type="button" onClick={() => setAsiste(v)}
              className={`p-btn-sec ${asiste === v ? `${activo} hover:opacity-90` : ""}`}>
              {t}
            </button>
          ))}
        </div>

        {asiste === "si" && (
          <>
            {familia && (
              <div>
                <label className="p-label" htmlFor="cant">¿Cuántos van?</label>
                <select id="cant" className="p-input" value={cantidad} onChange={(e) => setCantidad(e.target.value)}>
                  {Array.from({ length: inv.cupo }, (_, i) => i + 1).map((k) => (
                    <option key={k} value={k}>{k} {k === 1 ? "persona" : "personas"} de {inv.cupo}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid gap-3">
              {personas.slice(0, n).map((p, i) => (
                <div key={i} className="rounded-xl border border-linea p-3.5 grid gap-2.5">
                  {familia ? (
                    <input className="p-input" placeholder={`Nombre de la persona ${i + 1}`} value={p.nombre}
                      onChange={(e) => cambiar(i, "nombre", e.target.value)} aria-label={`Nombre de la persona ${i + 1}`} />
                  ) : (
                    <p className="m-0 font-medium">{inv.nombre}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {MENUS.map((m) => {
                      const activo = p.menu.includes(m.id);
                      return (
                        <button key={m.id} type="button" onClick={() => alternarMenu(i, m.id)} aria-pressed={activo}
                          className={`rounded-full border px-3 py-1.5 text-sm cursor-pointer transition ${
                            activo ? "bg-orange-50 border-orange-300 text-orange-800" : "bg-fondo-2 border-linea text-suave hover:text-texto"
                          }`}>
                          {activo && "✓ "}{m.nombre}
                        </button>
                      );
                    })}
                  </div>
                  <input className="p-input" placeholder="Otra restricción (opcional)" value={p.otra}
                    onChange={(e) => cambiar(i, "otra", e.target.value)} aria-label="Otra restricción" />
                </div>
              ))}
            </div>
          </>
        )}

        {error && <p className="text-alerta text-sm m-0" role="alert">{error}</p>}
        <div className="grid grid-cols-2 gap-2 sticky bottom-0 bg-fondo-2 pt-1">
          <button type="button" className="p-btn-sec" onClick={onCerrar}>Cancelar</button>
          <button className="p-btn" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

// Resumen para el salón: cuántos de cada menú y quiénes
function Menus({ personas }) {
  const grupos = [
    ...MENUS.map((m) => ({ titulo: m.nombre, lista: personas.filter((p) => p.menu.includes(m.id)).map((p) => ({ ...p, detalle: "" })) })),
    { titulo: "Otras", lista: personas.filter((p) => p.otra).map((p) => ({ ...p, detalle: p.otra })) },
  ];
  const exportar = () =>
    descargarCSV(`menus-especiales-15-${FIESTA.nombre.toLowerCase()}.csv`, [
      ["Persona", "Invitación", ...MENUS.map((m) => m.nombre), "Otra"],
      ...personas.map((p) => [p.nombre, p.invitacion, ...MENUS.map((m) => (p.menu.includes(m.id) ? "Sí" : "")), p.otra]),
    ]);

  if (!personas.length) {
    return <div className="p-card p-10 text-center text-sm text-suave">Todavía nadie pidió un menú especial.</div>;
  }
  return (
    <section>
      <div className="flex justify-end mb-4">
        <button className="p-btn-sec" onClick={exportar}><Icono nombre="descargar" />Exportar para el salón</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {grupos.map((g) => (
          <div key={g.titulo} className="p-card p-4 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="m-0 font-semibold">{g.titulo}</p>
              <span className="text-2xl font-semibold tabular-nums">{g.lista.length}</span>
            </div>
            {g.lista.length > 0 && (
              <ul className="list-none m-0 mt-3 p-0 grid gap-1.5 text-sm">
                {g.lista.map((p, k) => (
                  <li key={k} className="min-w-0">
                    <span className="font-medium">{p.nombre}</span>
                    {p.invitacion !== p.nombre && <span className="text-suave"> · {p.invitacion}</span>}
                    {p.detalle && <span className="block text-orange-700">{p.detalle}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
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
        <button className="p-btn-sec" onClick={exportar} disabled={!canciones.length}><Icono nombre="descargar" />Exportar</button>
      </div>
      {canciones.length === 0 ? (
        <div className="p-card p-10 text-center text-sm text-suave">Todavía nadie sugirió canciones.</div>
      ) : (
        <ul className="p-card list-none m-0 p-0 divide-y divide-gray-200">
          {canciones.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="m-0 font-medium truncate">{c.titulo} <span className="font-normal text-suave">· {c.artista}</span></p>
                <p className="text-xs text-suave m-0 mt-0.5">Sugerida por {c.sugerida_por}</p>
              </div>
              <button className="p-btn-peligro shrink-0" onClick={() => borrar(c)}><Icono nombre="papelera" />Quitar</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
