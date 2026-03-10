import { getGoogleSheets } from '../utils/google'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const sheets = getGoogleSheets()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: 'master_jenis_surat!A2:A'
    })

    const rows = response.data.values || []

    // Bersihkan row kosong
    const cleanedRows = rows
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map(row => row[0].toString().trim())

    return cleanedRows
  } catch (error: any) {
    console.error('GET MASTER JENIS SURAT ERROR:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Server Error'
    })
  }
})