import { getGoogleSheets } from '../utils/google'
import { getCookie } from 'h3'

function formatDateTime(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

function getMonthName(dateString: string) {
  const date = new Date(dateString + 'T00:00:00')
  const months = [
    'januari', 'februari', 'maret', 'april',
    'mei', 'juni', 'juli', 'agustus',
    'september', 'oktober', 'november', 'desember'
  ]
  return months[date.getMonth()]
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()
    const sheets = getGoogleSheets()

    const nip = getCookie(event, 'nip') || ''
    const nama = getCookie(event, 'nama') || ''

    const tanggal = body.tanggal || ''
    const jenis_surat = body.jenisSurat || ''
    const jumlah = Number(body.jumlah || 1)
    const created_at = formatDateTime(new Date())
    const bulan = getMonthName(tanggal)

    // 🔥 Ambil data existing
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: 'data_input!A2:G'
    })

    const rows = existing.data.values || []
    let rowIndexToUpdate = -1

    rows.forEach((row: any[], index: number) => {
      const rowTanggal = row[0]
      const rowNama = row[2]
      const rowJenis = row[3]
      const rowBulan = row[5]

      if (
        rowTanggal === tanggal &&
        rowNama === nama &&
        rowJenis === jenis_surat &&
        rowBulan === bulan
      ) {
        rowIndexToUpdate = index + 2 // karena mulai A2
      }
    })

    // ✅ Kalau ditemukan → UPDATE jumlah
    if (rowIndexToUpdate !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: config.spreadsheetId,
        range: `data_input!E${rowIndexToUpdate}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[jumlah]]
        }
      })

      return { success: true, mode: 'updated' }
    }

    // ✅ Kalau tidak ada → INSERT baru
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: 'data_input!A:G',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[tanggal, nip, nama, jenis_surat, jumlah, bulan, created_at]]
      }
    })

    return { success: true, mode: 'inserted' }

  } catch (err: any) {
    console.error('INPUT DINAS ERROR:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Server Error'
    })
  }
})