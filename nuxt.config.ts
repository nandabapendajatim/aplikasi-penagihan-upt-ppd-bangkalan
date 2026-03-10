// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    googleServiceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    spreadsheetId: process.env.SPREADSHEET_ID,
  }
})
