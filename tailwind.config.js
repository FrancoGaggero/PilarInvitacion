// Tailwind 3.4 (y no 4) para que la invitación se vea bien en navegadores viejos,
// como el navegador interno de WhatsApp en Android con el WebView sin actualizar.
// Los colores y fuentes salen de las variables de src/theme/theme.css.
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fondo: "var(--c-fondo)",
        "fondo-2": "var(--c-fondo-2)",
        texto: "var(--c-texto)",
        suave: "var(--c-texto-suave)",
        acento: "var(--c-acento)",
        destacado: "var(--c-destacado)",
        bordo: "var(--c-bordo)",
        papel: "var(--c-papel)",
        alerta: "var(--c-alerta)",
        linea: "var(--c-linea)",
        campo: "var(--c-campo)",
        panel: "var(--c-panel)",
      },
      fontFamily: {
        titulos: "var(--f-titulos)",
        texto: "var(--f-texto)",
        script: "var(--f-script)",
        versal: "var(--f-versal)",
      },
      borderRadius: {
        campo: "var(--r-campo)",
        boton: "var(--r-boton)",
      },
    },
  },
  plugins: [],
};
