import { getGoogleSheets } from '../utils/google'
import { getCookie } from 'h3'

function formatTanggal(tanggal: string) {

  const bulan = [
    "JAN", "FEB", "MAR", "APR", "MEI", "JUN",
    "JUL", "AGS", "SEP", "OKT", "NOV", "DES"
  ]

  const d = new Date(tanggal)

  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`

}

function emptyData(tanggal: string) {

  return {
    tanggal_raw: tanggal,
    tanggal: formatTanggal(tanggal),
    terima: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
    kembali: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
    sisa: { spso: 0, npp: 0, ntp: 0, jumlah: 0 }
  }

}

function generateTanggalDalamBulan(bulan: string) {

  const map: any = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
  }

  const tahun = new Date().getFullYear()
  const bulanIndex = map[bulan]

  const jumlahHari = new Date(tahun, bulanIndex + 1, 0).getDate()

  const arr: string[] = []

  for (let i = 1; i <= jumlahHari; i++) {

    const d = new Date(tahun, bulanIndex, i)
    arr.push(d.toISOString().slice(0, 10))

  }

  return arr

}

function bulanIndex(bulan: string) {

  const map: any = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
  }

  return map[bulan]

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

    const user = namaUser.toLowerCase().trim()

    const map: any = {}

    const targetMonth = bulanIndex(bulan)
    const tahun = new Date().getFullYear()

    // =========================
    // SK TERIMA
    // =========================

    const terimaRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: 'sk_terima!A2:E'
    })

    const terimaRows = terimaRes.data.values || []

    terimaRows.forEach((r: any[]) => {

      const tanggal = r[0]
      const nama = (r[2] || '').toLowerCase().trim()
      const jenis = (r[3] || '').toLowerCase().trim()
      const jumlah = Number(r[4] || 0)

      if (nama !== user) return

      const d = new Date(tanggal)

      if (d.getFullYear() !== tahun) return
      if (d.getMonth() > targetMonth) return

      if (!map[tanggal]) map[tanggal] = emptyData(tanggal)

      if (jenis === 'spso') map[tanggal].terima.spso += jumlah
      if (jenis === 'npp') map[tanggal].terima.npp += jumlah
      if (jenis === 'ntp') map[tanggal].terima.ntp += jumlah

    })


    // =========================
    // SK KEMBALI
    // =========================

    const kembaliRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: 'data_input!A2:F'
    })

    const kembaliRows = kembaliRes.data.values || []

    kembaliRows.forEach((r: any[]) => {

      const tanggal = r[0]
      const nama = (r[2] || '').toLowerCase().trim()
      const jenis = (r[3] || '').toLowerCase().trim()
      const jumlah = Number(r[4] || 0)

      if (nama !== user) return

      const d = new Date(tanggal)

      if (d.getFullYear() !== tahun) return
      if (d.getMonth() > targetMonth) return

      if (!map[tanggal]) map[tanggal] = emptyData(tanggal)

      if (jenis === 'spso') map[tanggal].kembali.spso += jumlah
      if (jenis === 'npp') map[tanggal].kembali.npp += jumlah
      if (jenis === 'ntp') map[tanggal].kembali.ntp += jumlah

    })


    // =========================
    // SORT SEMUA DATA TANGGAL
    // =========================

    const semuaTanggal = Object.keys(map).sort()

    let prev = { spso: 0, npp: 0, ntp: 0 }

    semuaTanggal.forEach((tgl) => {

      const item = map[tgl]

      item.terima.jumlah =
        item.terima.spso +
        item.terima.npp +
        item.terima.ntp

      item.kembali.jumlah =
        item.kembali.spso +
        item.kembali.npp +
        item.kembali.ntp

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


    // =========================
    // GENERATE BULAN FILTER
    // =========================

    const semuaTanggalBulan = generateTanggalDalamBulan(bulan)

    const result: any[] = []

    semuaTanggalBulan.forEach((tgl) => {

      if (map[tgl]) {

        result.push(map[tgl])

      } else {

        const item = emptyData(tgl)

        item.sisa = { ...prev }

        item.sisa.jumlah =
          item.sisa.spso +
          item.sisa.npp +
          item.sisa.ntp

        result.push(item)

      }

    })

    return result

  }

  catch (error: any) {

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Server Error'
    })

  }

})