import { FIESTA } from "../config/fiesta";
import { MOCK_INVITACIONES } from "../data/mockInvitaciones";

// Pantalla para quien entra sin código (o con uno que no existe).
// Los accesos de prueba solo aparecen en desarrollo (npm run dev / netlify dev).
export default function SinInvitacion({ noEncontrada, onElegir }) {
  return (
    <div className="min-h-svh grid place-items-center text-center px-6 py-16">
      <div className="max-w-md">
        <p className="font-titulos text-7xl text-acento m-0">15</p>
        <h1 className="font-titulos text-5xl mt-4 mb-4">{FIESTA.nombre}</h1>
        <p className="text-suave">
          {noEncontrada
            ? "No encontramos esta invitación. Revisá que el link sea el que te enviaron."
            : "Para ver tu invitación, abrí el link personal que te enviaron por WhatsApp."}
        </p>

        {import.meta.env.DEV && (
        <div className="mt-12 border-t border-linea pt-8">
          <p className="text-sm text-suave mb-4">Desarrollo: elegí un invitado de prueba</p>
          <div className="grid gap-2.5">
            {MOCK_INVITACIONES.map((i) => (
              <button
                key={i.codigo}
                type="button"
                className="btn-borde cursor-pointer bg-transparent"
                onClick={() => onElegir(i.codigo)}
              >
                {i.nombre} <span className="text-suave">({i.cupo === 1 ? "personal" : `${i.cupo} lugares`})</span>
              </button>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
