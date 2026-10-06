import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { confirmarAsistencia } from "../lib/api";
import { limiteConfirmacion, limiteTexto } from "../lib/fechas";

function crearEsquema(cupo) {
  return z
    .object({
      asiste: z.enum(["si", "no"], { errorMap: () => ({ message: "Elegí si vienen o no." }) }),
      cantidad: z.coerce.number().int().min(1).max(cupo),
      nombres: z.array(z.string().trim()).optional(),
      restricciones: z.string().trim().max(300).optional(),
      mensaje: z.string().trim().max(500).optional(),
    })
    .superRefine((d, ctx) => {
      if (d.asiste !== "si" || cupo === 1) return;
      (d.nombres || []).slice(0, d.cantidad).forEach((n, i) => {
        if (!n) ctx.addIssue({ code: "custom", path: ["nombres", i], message: "Escribí el nombre." });
      });
    });
}

export default function Confirmacion({ invitacion, onCambio }) {
  const { codigo, cupo, tipo, confirmacion } = invitacion;
  const [editando, setEditando] = useState(!confirmacion);
  const cerrada = new Date() > limiteConfirmacion;
  const familia = tipo === "familia";

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(crearEsquema(cupo)),
    defaultValues: {
      asiste: confirmacion?.asiste,
      cantidad: confirmacion?.cantidad || cupo,
      nombres: Array.from({ length: cupo }, (_, i) => confirmacion?.nombres?.[i] ?? ""),
      restricciones: confirmacion?.restricciones ?? "",
      mensaje: confirmacion?.mensaje ?? "",
    },
  });
  const asiste = useWatch({ control, name: "asiste" });
  const cantidad = Number(useWatch({ control, name: "cantidad" })) || 1;

  const [errorEnvio, setErrorEnvio] = useState("");
  const enviar = async (datos) => {
    setErrorEnvio("");
    const limpio = {
      ...datos,
      cantidad: datos.asiste === "si" ? (familia ? datos.cantidad : 1) : 0,
      nombres: datos.asiste === "si" && familia ? datos.nombres.slice(0, datos.cantidad) : [],
    };
    try {
      const guardada = await confirmarAsistencia(codigo, limpio);
      onCambio(guardada);
      setEditando(false);
    } catch (e) {
      setErrorEnvio(e.message);
    }
  };

  return (
    <section id="asistencia" className="seccion">
      <h2 className="titulo-seccion">{familia ? "¿Vienen?" : "¿Venís?"}</h2>

      {cerrada && !confirmacion ? (
        <p className="text-suave">
          El plazo para confirmar terminó el {limiteTexto}. Si todavía no respondiste, escribile directamente a la familia.
        </p>
      ) : !editando && confirmacion ? (
        <Resumen confirmacion={confirmacion} familia={familia} puedeEditar={!cerrada} onEditar={() => setEditando(true)} />
      ) : (
        <>
          <p className="text-suave mb-6">
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
                    <span className="block text-center py-3.5 px-2 border border-linea rounded-campo cursor-pointer transition peer-checked:border-acento peer-checked:bg-campo peer-checked:font-normal peer-focus-visible:outline-2 peer-focus-visible:outline-acento">
                      {t}
                    </span>
                  </label>
                ))}
              </div>
              {errors.asiste && <p className="text-alerta text-sm mt-2">{errors.asiste.message}</p>}
            </fieldset>

            <AnimatePresence initial={false}>
              {asiste === "si" && familia && (
                <motion.div
                  key="familia"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid gap-5 overflow-hidden"
                >
                  <div>
                    <label className="etiqueta" htmlFor="cantidad">¿Cuántos van?</label>
                    <select id="cantidad" className="campo" {...register("cantidad")}>
                      {Array.from({ length: cupo }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n} className="text-black">{n} {n === 1 ? "persona" : "personas"}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3">
                    <span className="etiqueta mb-0">Nombre de cada uno</span>
                    {Array.from({ length: cantidad }, (_, i) => (
                      <div key={i}>
                        <input className="campo" placeholder={`Persona ${i + 1}`} aria-label={`Nombre de la persona ${i + 1}`} {...register(`nombres.${i}`)} />
                        {errors.nombres?.[i] && <p className="text-alerta text-sm mt-1">{errors.nombres[i].message}</p>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {asiste === "si" && (
              <div>
                <label className="etiqueta" htmlFor="restricciones">Restricciones alimentarias (opcional)</label>
                <input id="restricciones" className="campo" placeholder="Ej.: vegetariano, celíaco" {...register("restricciones")} />
              </div>
            )}

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
    </section>
  );
}

function Resumen({ confirmacion, familia, puedeEditar, onEditar }) {
  const va = confirmacion.asiste === "si";
  return (
    <div className="border border-linea rounded-campo p-6">
      <p className="font-titulos text-3xl text-destacado m-0">
        {va ? (familia ? "¡Los esperamos!" : "¡Te espero!") : "Gracias por avisar"}
      </p>
      <p className="text-suave mt-2 mb-0">
        {va
          ? familia
            ? `Confirmaron ${confirmacion.cantidad} ${confirmacion.cantidad === 1 ? "lugar" : "lugares"}: ${confirmacion.nombres.join(", ")}.`
            : "Tu lugar está confirmado."
          : "Registramos que no van a poder venir."}
      </p>
      {puedeEditar && (
        <button type="button" onClick={onEditar} className="mt-5 bg-transparent border-0 p-0 text-acento underline underline-offset-4 cursor-pointer">
          Cambiar respuesta
        </button>
      )}
    </div>
  );
}
