// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  postcss: {
    plugins: {
      'tailwindcss/nesting': {},
      tailwindcss: {}
    },
  },
  pages: true,
  css: ['~/assets/css/tailwind.css']
});