import { getGoogleSheets } from '../utils/google'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const sheets = getGoogleSheets()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `faq_bot!A2:C` // kolom: pertanyaan | jawaban | kategori
    })

    const rows = res.data.values || []

    // mapping biar enak dipakai di frontend
    const data = rows.map((r: any[]) => ({
      pertanyaan: r[0] || '',
      jawaban: r[1] || '',
      kategori: r[2] || ''
    }))

    return data

  } catch (err: any) {
    console.error(err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal ambil FAQ'
    })
  }
})