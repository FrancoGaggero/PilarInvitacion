import { FIESTA } from "../config/fiesta";

export default function Pie() {
  return (
    <footer className="border-t border-linea text-center pt-16 pb-20 px-6">
      <p className="font-titulos text-4xl text-acento m-0">¡Te espero!</p>
      <p className="text-suave mt-2">{FIESTA.nombre}</p>
    </footer>
  );
}
