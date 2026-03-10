import { getGoogleSheets } from '../utils/google'

export default defineEventHandler(async (event) => {
  try {
    const { bulan } = getQuery(event)
    const config = useRuntimeConfig()
    const sheets = getGoogleSheets()

    const namaUser = getCookie(event, 'nama')

    if (!namaUser) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    if (!bulan) {
      throw createError({ statusCode: 400, statusMessage: 'Bulan tidak boleh kosong' })
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `sk_terima!A2:E`
    })

    const rows = response.data.values || []

    const rawData = rows.map((row: any[]) => ({
      tanggal: row[0] || '',
      bulan: (row[1] || '').toLowerCase().trim(),
      nama: (row[2] || '').trim(),
      jenis: (row[3] || '').toLowerCase().trim(),
      jumlah: Number(row[4] || 0)
    }))

    // 🔥 Filter berdasarkan bulan & user login
    const filtered = rawData.filter(r =>
      r.bulan === bulan.toString().toLowerCase().trim() &&
      r.nama.toLowerCase() === namaUser.toLowerCase().trim()
    )

    const result: any = {}

    // 🔥 Kelompokkan per tanggal
    filtered.forEach(row => {
      if (!result[row.tanggal]) {
        result[row.tanggal] = {
          tanggal: row.tanggal,
          terima: { spso: 0, npp: 0, ntp: 0, jumlah: 0 }
        }
      }

      if (row.jenis === 'spso') {
        result[row.tanggal].terima.spso += row.jumlah
      }

      if (row.jenis === 'npp') {
        result[row.tanggal].terima.npp += row.jumlah
      }

      if (row.jenis === 'ntp') {
        result[row.tanggal].terima.ntp += row.jumlah
      }
    })

    // 🔥 HITUNG TOTAL
    Object.values(result).forEach((item: any) => {
      item.terima.jumlah =
        item.terima.spso +
        item.terima.npp +
        item.terima.ntp
    })

    // 🔥 SORT BERDASARKAN TANGGAL
    const sorted = Object.values(result).sort((a: any, b: any) =>
      a.tanggal.localeCompare(b.tanggal)
    )

    return sorted

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Server Error'
    })
  }
})