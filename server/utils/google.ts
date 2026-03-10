import { google } from 'googleapis'

export const getGoogleSheets = () => {
  const config = useRuntimeConfig()

  const credentials = JSON.parse(config.googleServiceAccountKey as string)

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  return google.sheets({ version: 'v4', auth })
}