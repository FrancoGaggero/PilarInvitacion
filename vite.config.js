import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tailwind se procesa con PostCSS (ver postcss.config.js y tailwind.config.js)
export default defineConfig({
  plugins: [react()],
});
