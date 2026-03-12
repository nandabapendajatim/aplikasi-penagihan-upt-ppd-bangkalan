import { getGoogleSheets } from '../utils/google'
import { getCookie } from 'h3'

function formatTanggal(tanggal: string) {

  const bulan = [
    "JAN","FEB","MAR","APR","MEI","JUN",
    "JUL","AGS","SEP","OKT","NOV","DES"
  ]

  const d = new Date(tanggal)

  const hari = d.getDate()
  const bulanText = bulan[d.getMonth()]
  const tahun = d.getFullYear()

  return `${hari} ${bulanText} ${tahun}`
}

export default defineEventHandler(async (event) => {

  try {

    const { bulan } = getQuery(event)

    const config = useRuntimeConfig()
    const sheets = getGoogleSheets()

    const namaUser = getCookie(event, 'nama')

    if (!namaUser) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const map: any = {}

    // =========================
    // SK TERIMA
    // =========================

    const terimaRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `sk_terima!A2:E`
    })

    const terimaRows = terimaRes.data.values || []

    terimaRows.forEach((row: any[]) => {

      const tanggal = row[0]
      const bulanRow = (row[1] || '').toLowerCase().trim()
      const nama = (row[2] || '').toLowerCase().trim()
      const jenis = (row[3] || '').toLowerCase().trim()
      const jumlah = Number(row[4] || 0)

      if (bulanRow !== bulan) return
      if (nama !== namaUser.toLowerCase()) return

      if (!map[tanggal]) {
        map[tanggal] = {
          tanggal_raw: tanggal,
          tanggal: formatTanggal(tanggal),
          terima: { spso:0, npp:0, ntp:0, jumlah:0 },
          kembali: { spso:0, npp:0, ntp:0, jumlah:0 },
          sisa: { spso:0, npp:0, ntp:0, jumlah:0 }
        }
      }

      if (jenis === 'spso') map[tanggal].terima.spso += jumlah
      if (jenis === 'npp') map[tanggal].terima.npp += jumlah
      if (jenis === 'ntp') map[tanggal].terima.ntp += jumlah

    })


    // =========================
    // SK KEMBALI
    // =========================

    const kembaliRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `data_input!A2:F`
    })

    const kembaliRows = kembaliRes.data.values || []

    kembaliRows.forEach((row: any[]) => {

      const tanggal = row[0]
      const nama = (row[2] || '').toLowerCase().trim()
      const jenis = (row[3] || '').toLowerCase().trim()
      const jumlah = Number(row[4] || 0)
      const bulanRow = (row[5] || '').toLowerCase().trim()

      if (bulanRow !== bulan) return
      if (nama !== namaUser.toLowerCase()) return

      if (!map[tanggal]) {
        map[tanggal] = {
          tanggal_raw: tanggal,
          tanggal: formatTanggal(tanggal),
          terima: { spso:0, npp:0, ntp:0, jumlah:0 },
          kembali: { spso:0, npp:0, ntp:0, jumlah:0 },
          sisa: { spso:0, npp:0, ntp:0, jumlah:0 }
        }
      }

      if (jenis === 'spso') map[tanggal].kembali.spso += jumlah
      if (jenis === 'npp') map[tanggal].kembali.npp += jumlah
      if (jenis === 'ntp') map[tanggal].kembali.ntp += jumlah

    })


    // =========================
    // TOTAL TERIMA & KEMBALI
    // =========================

    Object.values(map).forEach((item: any) => {

      item.terima.jumlah =
        item.terima.spso +
        item.terima.npp +
        item.terima.ntp

      item.kembali.jumlah =
        item.kembali.spso +
        item.kembali.npp +
        item.kembali.ntp

    })


    // =========================
    // SORT TANGGAL (PAKAI RAW)
    // =========================

    const sorted: any = Object.values(map).sort((a: any, b: any) =>
      a.tanggal_raw.localeCompare(b.tanggal_raw)
    )


    // =========================
    // HITUNG SISA (RUNNING)
    // =========================

    let prev = { spso:0, npp:0, ntp:0 }

    sorted.forEach((item: any) => {

      item.sisa.spso =
        prev.spso +
        item.terima.spso -
        item.kembali.spso

      item.sisa.npp =
        prev.npp +
        item.terima.npp -
        item.kembali.npp

      item.sisa.ntp =
        prev.ntp +
        item.terima.ntp -
        item.kembali.ntp

      item.sisa.jumlah =
        item.sisa.spso +
        item.sisa.npp +
        item.sisa.ntp

      prev = {
        spso: item.sisa.spso,
        npp: item.sisa.npp,
        ntp: item.sisa.ntp
      }

    })


    return sorted

  }

  catch (error: any) {

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Server Error'
    })

  }

})