import { getGoogleSheets } from '../utils/google'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const sheets = getGoogleSheets()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: 'master_jenis_surat!A2:E'
  })

  return response.data.values || []
})