import { LottieLight } from "lottie-react";
import datos from "../assets/lottie/destellos.json";

// Estallido dorado (Lottie). Se carga aparte (lazy) para no pesar en el primer render.
// La animación se genera con scripts/destellos-lottie.mjs (sin expresiones, por eso alcanza LottieLight).
export default function Destellos({ className = "" }) {
  return (
    <div aria-hidden="true" className={className}>
      <LottieLight src={datos} autoplay style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
