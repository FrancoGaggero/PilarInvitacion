import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { confirmarAsistencia } from "../lib/api";
import { limiteConfirmacion, limiteTexto } from "../lib/fechas";
import { MENUS, personasDe, personasIniciales, armarConfirmacion, textoMenus, tieneMenuEspecial } from "../lib/menus";
import Seccion from "./Seccion";

function crearEsquema(cupo, familia) {
  return z
    .object({
      asiste: z.enum(["si", "no"], { errorMap: () => ({ message: "Elegí si vienen o no." }) }),
      cantidad: z.coerce.number().int().min(1).max(cupo),
      invitados: z.array(z.object({
        nombre: z.string().trim().max(80),
        menu: z.array(z.string()).optional(),
        otra: z.string().trim().max(120).optional(),
      })),
      mensaje: z.string().trim().max(500).optional(),
    })
    .superRefine((d, ctx) => {
      if (d.asiste !== "si" || !familia) return;
      d.invitados.slice(0, d.cantidad).forEach((p, i) => {
        if (!p.nombre) ctx.addIssue({ code: "custom", path: ["invitados", i, "nombre"], message: "Escribí el nombre." });
      });
    });
}

export default function Confirmacion({ invitacion, onCambio }) {
  const { codigo, cupo, tipo, confirmacion } = invitacion;
  const [editando, setEditando] = useState(!confirmacion);
  const cerrada = new Date() > limiteConfirmacion;
  const familia = tipo === "familia";

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(crearEsquema(cupo, familia)),
    defaultValues: {
      asiste: confirmacion?.asiste,
      cantidad: confirmacion?.cantidad || cupo,
      invitados: personasIniciales(confirmacion, cupo),
      mensaje: confirmacion?.mensaje ?? "",
    },
  });
  const asiste = useWatch({ control, name: "asiste" });
  const cantidad = Number(useWatch({ control, name: "cantidad" })) || 1;

  const [errorEnvio, setErrorEnvio] = useState("");
  const enviar = async (datos) => {
    setErrorEnvio("");
    try {
      const guardada = await confirmarAsistencia(codigo, armarConfirmacion(datos, invitacion));
      onCambio(guardada);
      setEditando(false);
    } catch (e) {
      setErrorEnvio(e.message);
    }
  };

  return (
    <Seccion id="asistencia" antetitulo="Confirmación" titulo={familia ? "¿Vienen?" : "¿Venís?"}>

      {cerrada && !confirmacion ? (
        <p className="text-suave">
          El plazo para confirmar terminó el {limiteTexto}. Si todavía no respondiste, escribile directamente a la familia.
        </p>
      ) : !editando && confirmacion ? (
        <Resumen confirmacion={confirmacion} familia={familia} puedeEditar={!cerrada} onEditar={() => setEditando(true)} />
      ) : (
        <>
          <p className="italic text-suave text-center mb-8">
            {familia
              ? `Tienen ${cupo} lugares reservados. Confirmen antes del ${limiteTexto}.`
              : `Confirmá antes del ${limiteTexto}.`}
          </p>
          <form onSubmit={handleSubmit(enviar)} noValidate className="grid gap-5">
            <fieldset className="border-0 p-0 m-0">
              <legend className="sr-only">¿Asisten?</legend>
              <div className="grid grid-cols-2 gap-2.5">
                {[["si", familia ? "Sí, vamos" : "Sí, voy"], ["no", familia ? "No podemos" : "No puedo"]].map(([v, t]) => (
                  <label key={v} className="relative">
                    <input type="radio" value={v} {...register("asiste")} className="peer absolute inset-0 opacity-0 cursor-pointer" />
                    <span className="block text-center py-3.5 px-2 border border-linea rounded-campo cursor-pointer transition font-versal tracking-[0.1em] peer-checked:border-acento peer-checked:bg-bordo peer-checked:text-texto peer-focus-visible:outline-2 peer-focus-visible:outline-acento">
                      {t}
                    </span>
                  </label>
                ))}
              </div>
              {errors.asiste && <p className="text-alerta text-sm mt-2">{errors.asiste.message}</p>}
            </fieldset>

            <AnimatePresence initial={false}>
              {asiste === "si" && (
                <motion.div
                  key="personas"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid gap-5 overflow-hidden"
                >
                  {familia && (
                    <div>
                      <label className="etiqueta" htmlFor="cantidad">¿Cuántos van?</label>
                      <select id="cantidad" className="campo" {...register("cantidad")}>
                        {Array.from({ length: cupo }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n} className="text-black">{n} {n === 1 ? "persona" : "personas"}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {familia ? (
                    <div className="grid gap-3">
                      <p className="etiqueta mb-0">Quiénes van y si alguien necesita un menú especial</p>
                      {Array.from({ length: cantidad }, (_, i) => (
                        <div key={i} className="border border-linea rounded-campo p-4 grid gap-3">
                          <input
                            className="campo"
                            placeholder={`Nombre y apellido de la persona ${i + 1}`}
                            aria-label={`Nombre de la persona ${i + 1}`}
                            {...register(`invitados.${i}.nombre`)}
                          />
                          {errors.invitados?.[i]?.nombre && (
                            <p className="text-alerta text-sm -mt-1 mb-0">{errors.invitados[i].nombre.message}</p>
                          )}
                          <OpcionesMenu i={i} register={register} control={control} setValue={setValue} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <p className="etiqueta mb-0">¿Necesitás un menú especial?</p>
                      <OpcionesMenu i={0} register={register} control={control} setValue={setValue} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="etiqueta" htmlFor="mensaje">Mensaje para {familia ? "Pilar" : "mí"} (opcional)</label>
              <textarea id="mensaje" rows={3} className="campo resize-y" {...register("mensaje")} />
            </div>

            <button type="submit" className="btn-primario" disabled={isSubmitting}>
              {isSubmitting ? "Enviando…" : "Enviar confirmación"}
            </button>
            {errorEnvio && <p className="text-alerta text-sm m-0" role="alert">{errorEnvio}</p>}
          </form>
        </>
      )}
    </Seccion>
  );
}

// Opciones de menú de una persona: se tocan como botones (se pueden elegir varias)
// y "Otra" abre un campo para escribir (alergias, etc.)
function OpcionesMenu({ i, register, control, setValue }) {
  const otra = useWatch({ control, name: `invitados.${i}.otra` });
  const [conOtra, setConOtra] = useState(Boolean(otra));
  const chip =
    "block px-3.5 py-2 border border-linea rounded-full cursor-pointer transition text-[1rem] leading-tight select-none " +
    "peer-checked:bg-bordo peer-checked:border-acento peer-checked:text-texto peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-acento";

  return (
    <div className="grid gap-2.5">
      <div className="flex flex-wrap gap-2">
        {MENUS.map((m) => (
          <label key={m.id} className="relative">
            <input type="checkbox" value={m.id} {...register(`invitados.${i}.menu`)} className="peer absolute opacity-0 w-0 h-0" />
            <span className={chip}>{m.nombre}</span>
          </label>
        ))}
        <label className="relative">
          <input type="checkbox" checked={conOtra} onChange={(e) => { setConOtra(e.target.checked); if (!e.target.checked) setValue(`invitados.${i}.otra`, ""); }} className="peer absolute opacity-0 w-0 h-0" />
          <span className={chip}>Otra…</span>
        </label>
      </div>
      {conOtra && (
        <input
          className="campo"
          placeholder="Contanos cuál (ej.: alergia a los frutos secos)"
          aria-label="Otra restricción alimentaria"
          {...register(`invitados.${i}.otra`)}
        />
      )}
    </div>
  );
}

function Resumen({ confirmacion, familia, puedeEditar, onEditar }) {
  const va = confirmacion.asiste === "si";
  const personas = personasDe(confirmacion);
  return (
    <div className="text-center border border-linea rounded-campo p-6" style={{ outline: "1px solid var(--c-linea)", outlineOffset: "-6px" }}>
      <p className="font-script text-5xl leading-tight text-acento m-0">
        {va ? (familia ? "¡Los esperamos!" : "¡Te espero!") : "Gracias por avisar"}
      </p>
      <p className="text-suave mt-2 mb-0">
        {va
          ? familia
            ? `Confirmaron ${confirmacion.cantidad} ${confirmacion.cantidad === 1 ? "lugar" : "lugares"}.`
            : "Tu lugar está confirmado."
          : "Registramos que no van a poder venir."}
      </p>
      {va && (familia || personas.some(tieneMenuEspecial)) && (
        <ul className="list-none p-0 mt-4 mb-0 grid gap-1">
          {personas.map((p, i) => (
            <li key={i}>
              {familia && <span>{p.nombre}</span>}
              {tieneMenuEspecial(p) && (
                <span className="italic text-destacado">{familia ? " · " : "Menú: "}{textoMenus(p)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {puedeEditar && (
        <button type="button" onClick={onEditar} className="mt-5 bg-transparent border-0 p-0 text-acento underline underline-offset-4 cursor-pointer">
          Cambiar respuesta
        </button>
      )}
    </div>
  );
}
