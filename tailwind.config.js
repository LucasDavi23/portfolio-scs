// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx,vue,php}",
    "./assets/**/*.{html,js,ts,jsx,tsx,vue,php}",
    "!./node_modules/**",
    "!./dist/**",
  ],

  theme: {
    extend: {
      spacing: {
        3.25: "0.8125rem",
        4.5: "1.125rem",
        5.5: "1.375rem",
      },
      maxWidth: {
        "screen-2xl-tight": "1320px", // alternativa mais estreita ao 1536px
        "screen-xl-tight": "1200px",
      },
    },
  },

  safelist: [
    // ====== CLASSES EXPLÍCITAS QUE VOCÊ USA NO TOPO ======
    // grid 7/3/auto no topo
    "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]",
    // larguras máximas do 3º card (use a que ficar melhor)
    "md:max-w-[200px]",
    "md:max-w-[220px]",
    "md:max-w-[240px]",
    "md:justify-self-end",

    // ====== MODAL & CONTAINERS USADOS ======
    "w-[96vw]",
    "max-w-[1100px]",
    "xl:max-w-[1400px]",
    "2xl:max-w-[1600px]",
    "max-h-[90vh]",
    "shadow-[0_10px_25px_-10px_rgba(0,0,0,.35)]",
    "backdrop-blur-sm",
    "[backdrop-saturate:160%]",
    "bg-gradient-to-b",
    "from-black/0",
    "to-black/35",
    "ring-black/10",
    "border-white/60",
    "hidden",
    "duration-500",
    "ease-in-out",
    "translate-x-full",
    "-translate-x-full",
    "resize-none",

    // ====== THUMBNAIL PREVIEW ======
    "w-20",
    "h-20",
    "w-24",
    "h-24",
    "max-w-[6rem]",
    "max-h-[6rem]",
    "overflow-hidden",
    "rounded-lg",
    "border",
    "border-gray-200",
    "bg-white",
    "shadow-sm",
    "object-cover",
    "flex",
    "items-center",
    "justify-center",

    // ====== ALTURAS FIXAS QUE VOCÊ USOU ======
    "h-[520px]",
    "h-[540px]",
    "h-[560px]",
    "max-h-[520px]",
    "max-h-[560px]",

    // ====== PADRÕES (REGEX) — ARBITRARY VALUES + VARIANTES ======
    // largura/altura/inset/translate com valores arbitrários, ex: w-[372px], h-[1px], top-[3.5rem], translate-x-[-50%], etc.
    {
      pattern:
        /^(w|min-w|max-w|h|max-h|inset|top|left|right|bottom|translate-x|translate-y)-\[(.+)\]$/,
      variants: ["sm", "md", "lg", "xl", "2xl"],
    },

    // max-h com valores arbitrários e variantes (já coberto acima, mas mantemos específico p/ garantir)
    { pattern: /^max-h-\[(.+)\]$/, variants: ["sm", "md", "lg", "xl", "2xl"] },

    // grid com template arbitrário (ex.: grid-cols-[minmax(0,1fr)_auto], etc)
    {
      pattern: /^grid-cols-\[(.+)\]$/,
      variants: ["sm", "md", "lg", "xl", "2xl"],
    },

    // cores com opacidade custom via slash
    { pattern: /^(bg|ring|text|border)-black\/(5|10|20|35|40|60)$/ },
    { pattern: /^(bg|ring|text|border)-white\/(40|50|60|90|95)$/ },
  ],

  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
