import { lazy, Suspense, useEffect, useState } from "react";
import { obtenerInvitacion } from "./lib/api";
import Portada from "./components/Portada";
import Evento from "./components/Evento";
import DressCode from "./components/DressCode";
import Confirmacion from "./components/Confirmacion";
import Canciones from "./components/Canciones";
import Pie from "./components/Pie";
import SinInvitacion from "./components/SinInvitacion";

// El panel se descarga solo cuando alguien entra a /panel
const Panel = lazy(() => import("./panel/Panel"));

// El código sale de /i/abc123 (producción) o de ?i=abc123 (vista previa)
function leerCodigo() {
  const m = window.location.pathname.match(/^\/i\/([a-z0-9]+)/i);
  if (m) return m[1];
  return new URLSearchParams(window.location.search).get("i");
}

export default function App() {
  if (window.location.pathname.startsWith("/panel")) {
    return (
      <Suspense fallback={<div className="min-h-svh grid place-items-center text-suave">Cargando…</div>}>
        <Panel />
      </Suspense>
    );
  }
  return <Invitacion />;
}

function Invitacion() {
  const [codigo, setCodigo] = useState(leerCodigo);
  const [estado, setEstado] = useState(codigo ? "cargando" : "sin-codigo");
  const [invitacion, setInvitacion] = useState(null);

  useEffect(() => {
    if (!codigo) { setEstado("sin-codigo"); return; }
    setEstado("cargando");
    obtenerInvitacion(codigo)
      .then((inv) => {
        setInvitacion(inv);
        setEstado(inv ? "lista" : "no-encontrada");
        window.scrollTo(0, 0);
      })
      .catch(() => setEstado("error"));
  }, [codigo]);

  if (estado === "cargando") {
    return <div className="min-h-svh grid place-items-center text-suave">Abriendo tu invitación…</div>;
  }
  if (estado === "error") {
    return (
      <div className="min-h-svh grid place-items-center text-center px-6 text-suave">
        No pudimos abrir la invitación. Revisá tu conexión y volvé a cargar la página.
      </div>
    );
  }
  if (estado !== "lista") {
    return <SinInvitacion noEncontrada={estado === "no-encontrada"} onElegir={setCodigo} />;
  }

  return (
    <>
      <Portada invitacion={invitacion} />
      <main className="mx-auto max-w-[38rem] px-6">
        <Evento />
        <DressCode />
        <Confirmacion invitacion={invitacion} onCambio={(c) => setInvitacion({ ...invitacion, confirmacion: c })} />
        <Canciones invitacion={invitacion} />
      </main>
      <Pie />
    </>
  );
}
