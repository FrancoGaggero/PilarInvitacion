import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { obtenerInvitacion } from "./lib/api";
import { FIESTA } from "./config/fiesta";
import FondoFijo from "./components/FondoFijo";
import Intro from "./components/Intro";
import Portada from "./components/Portada";
import Evento from "./components/Evento";
import Galeria, { FotoSuelta } from "./components/Galeria";
import DressCode from "./components/DressCode";
import Confirmacion from "./components/Confirmacion";
import Canciones from "./components/Canciones";
import Pie from "./components/Pie";
import SinInvitacion from "./components/SinInvitacion";
import VentanaFlores from "./components/VentanaFlores";
import FlorFlotante, { Adorno } from "./components/flores/FlorFlotante";
import { FLORES } from "./assets/flores";

// El panel se descarga solo cuando alguien entra a /panel
const Panel = lazy(() => import("./panel/Panel"));

// El código sale de /i/abc123 (producción) o de ?i=abc123 (vista previa)
function leerCodigo() {
  const m = window.location.pathname.match(/^\/i\/([a-z0-9]+)/i);
  if (m) return m[1];
  return new URLSearchParams(window.location.search).get("i");
}

// El sobre de entrada se muestra una vez por sesión del navegador
const claveIntro = (codigo) => `sobre-abierto-${codigo}`;
function sobreYaAbierto(codigo) {
  try { return sessionStorage.getItem(claveIntro(codigo)) === "1"; } catch { return false; }
}

export default function App() {
  if (window.location.pathname.startsWith("/panel")) {
    document.documentElement.classList.add("tema-panel"); // estilo neutro del panel (theme.css)
    return (
      <Suspense fallback={<div className="min-h-svh grid place-items-center text-suave">Cargando…</div>}>
        <Panel />
      </Suspense>
    );
  }
  return (
    <MotionConfig reducedMotion="user">
      <FondoFijo />
      <Invitacion />
    </MotionConfig>
  );
}

function Invitacion() {
  const quieto = useReducedMotion();
  const [codigo, setCodigo] = useState(leerCodigo);
  const [estado, setEstado] = useState(codigo ? "cargando" : "sin-codigo");
  const [invitacion, setInvitacion] = useState(null);
  const [abierta, setAbierta] = useState(() => quieto || (codigo && sobreYaAbierto(codigo)));

  useEffect(() => {
    if (!codigo) { setEstado("sin-codigo"); return; }
    setEstado("cargando");
    setAbierta(quieto || sobreYaAbierto(codigo));
    obtenerInvitacion(codigo)
      .then((inv) => {
        setInvitacion(inv);
        setEstado(inv ? "lista" : "no-encontrada");
        window.scrollTo(0, 0);
      })
      .catch(() => setEstado("error"));
  }, [codigo]);

  const abrirSobre = () => {
    try { sessionStorage.setItem(claveIntro(codigo), "1"); } catch { /* modo privado */ }
    setAbierta(true);
  };

  if (estado === "cargando") {
    return <div className="min-h-svh grid place-items-center italic text-suave">Abriendo tu invitación…</div>;
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

  const [foto1, ...resto] = FIESTA.book;
  return (
    <>
      <AnimatePresence>
        {!abierta && <Intro key="intro" nombre={invitacion.nombre} onAbrir={abrirSobre} />}
      </AnimatePresence>
      {abierta && (
        // recorta a los costados las flores que asoman, sin generar scroll horizontal
        <div className="recorte-x">
          <Portada invitacion={invitacion} />
          <main className="mx-auto max-w-[36rem] px-4">
            {foto1 && <FotoSuelta foto={foto1} frase="Quince años, un solo sueño" />}
            {/* las flores cuelgan entre secciones y se mueven a otra velocidad que el contenido */}
            <Adorno><FlorFlotante src={FLORES.rama} className="-left-16 -top-10 w-48" velocidad={-140} giro={-12} /></Adorno>
            <Evento />
            {resto.length > 0 && <Galeria fotos={resto} />}
            <Adorno><FlorFlotante src={FLORES.capullo} className="-right-8 -top-24 w-24" velocidad={-180} giro={20} /></Adorno>
            <DressCode />
            <VentanaFlores />
            <Adorno><FlorFlotante src={FLORES.peonia} className="-left-12 -top-14 w-32" velocidad={-120} giro={-20} /></Adorno>
            <Confirmacion invitacion={invitacion} onCambio={(c) => setInvitacion({ ...invitacion, confirmacion: c })} />
            <Adorno><FlorFlotante src={FLORES.rama} className="-right-20 -top-12 w-48" velocidad={-160} giro={170} /></Adorno>
            <Canciones invitacion={invitacion} />
          </main>
          <Pie />
        </div>
      )}
    </>
  );
}
