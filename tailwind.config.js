// /tailwind.config.js
/** @type {import('tailwindcss').Config} */

/* -----------------------------------------------------------------------------*/
/* 🧩 Tailwind — System Config
 *
 * Nível / Level: Core / Foundation
 *
 * PT: Configuração central do Tailwind para o sistema.
 *     Define fontes de conteúdo, extensões de tema,
 *     safelist de classes dinâmicas e plugins.
 *
 * EN: Central Tailwind configuration for the system.
 *     Defines content sources, theme extensions,
 *     safelist for dynamic classes and plugins.
 */
/* -----------------------------------------------------------------------------*/

module.exports = {
  /* ---------------------------------------------------------------------------*/
  /* Content Sources
   *
   * PT: Arquivos monitorados pelo Tailwind para geração das classes.
   * EN: Files scanned by Tailwind to generate utility classes.
   */
  /* ---------------------------------------------------------------------------*/

  content: [
    './index.html',
    './src/**/*.{html,js,ts,jsx,tsx,vue,php}',
    './assets/**/*.{html,js,ts,jsx,tsx,vue,php}',
    '!./node_modules/**',
    '!./dist/**',
  ],

  /* ---------------------------------------------------------------------------*/
  /* Theme Extensions
   *
   * PT: Extensões do tema padrão usadas pelo sistema.
   * EN: Extensions to the default theme used by the system.
   */
  /* ---------------------------------------------------------------------------*/
  theme: {
    extend: {
      spacing: {
        3.25: '0.8125rem',
        4.5: '1.125rem',
        5.5: '1.375rem',
      },
      maxWidth: {
        'screen-2xl-tight': '1320px',
        'screen-xl-tight': '1200px',
      },

      screens: {
        nb: { max: '1440px' },
      },
    },
  },

  /* ---------------------------------------------------------------------------*/
  /* Safelist
   *
   * PT: Classes preservadas manualmente para casos dinâmicos
   *     ou utilidades com valores arbitrários.
   *
   * EN: Classes manually preserved for dynamic cases
   *     or utilities with arbitrary values.
   */
  /* ---------------------------------------------------------------------------*/

  safelist: [
    /* Top Layout */
    'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]',

    'md:max-w-[200px]',
    'md:max-w-[220px]',
    'md:max-w-[240px]',
    'md:justify-self-end',

    /* Modal & Containers */
    'w-[96vw]',
    'max-w-[1100px]',
    'xl:max-w-[1400px]',
    '2xl:max-w-[1600px]',
    'max-h-[90vh]',
    'shadow-[0_10px_25px_-10px_rgba(0,0,0,.35)]',
    'backdrop-blur-sm',
    '[backdrop-saturate:160%]',
    'bg-gradient-to-b',
    'from-black/0',
    'to-black/35',
    'ring-black/10',
    'border-white/60',
    'hidden',
    'duration-500',
    'ease-in-out',
    'translate-x-full',
    '-translate-x-full',
    'resize-none',

    /* Thumbnail Preview */
    'w-20',
    'h-20',
    'w-24',
    'h-24',
    'max-w-[6rem]',
    'max-h-[6rem]',
    'overflow-hidden',
    'rounded-lg',
    'border',
    'border-gray-200',
    'bg-white',
    'shadow-sm',
    'object-cover',
    'flex',
    'items-center',
    'justify-center',

    /* Fixed Heights */
    'h-[520px]',
    'h-[540px]',
    'h-[560px]',
    'max-h-[520px]',
    'max-h-[560px]',

    /* Scale Utilities */
    { pattern: /^(scale|scale-x|scale-y)-\[(.+)\]$/, variants: ['sm', 'md', 'lg', 'xl', '2xl'] },

    /* Arbitrary Size / Position Utilities */
    {
      pattern:
        /^(w|min-w|max-w|h|max-h|inset|top|left|right|bottom|translate-x|translate-y)-\[(.+)\]$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },

    /* Arbitrary Max Height */
    { pattern: /^max-h-\[(.+)\]$/, variants: ['sm', 'md', 'lg', 'xl', '2xl'] },

    /* Arbitrary Grid Columns */
    {
      pattern: /^grid-cols-\[(.+)\]$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },

    /* Color Opacity Variants */
    { pattern: /^(bg|ring|text|border)-black\/(5|10|20|35|40|60)$/ },
    { pattern: /^(bg|ring|text|border)-white\/(40|50|60|90|95)$/ },
  ],
  /* ---------------------------------------------------------------------------*/
  /* Plugins
   *
   * PT: Plugins oficiais utilizados no sistema.
   * EN: Official plugins used by the system.
   */
  /* ---------------------------------------------------------------------------*/
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
