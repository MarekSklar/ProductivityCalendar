import { env } from 'node:process';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    databaseFilePath: env.DATABASE_PATH
  },
  postcss: {
    plugins: {
      'tailwindcss/nesting': {},
      tailwindcss: {}
    },
  },
  pages: true,
  css: ['~/assets/css/tailwind.css']
});