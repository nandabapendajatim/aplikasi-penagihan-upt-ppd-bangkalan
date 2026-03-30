import { getGoogleSheets } from '../utils/google'
import { getCookie } from 'h3'

// =========================
// FORMAT TANGGAL DISPLAY
// =========================
const BULAN_NAMA = [
  'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN',
  'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'
]

function formatTanggal(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${BULAN_NAMA[d.getMonth()]} ${d.getFullYear()}`
}

// =========================
// NORMALISASI YYYY-MM-DD
// =========================
function normalizeDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// =========================
// MAP BULAN
// =========================
function getMonthIndex(bulan: string) {
  const map: any = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
  }
  return map[bulan]
}

// =========================
// SALDO AWAL (bulan sebelumnya)
// =========================
async function getSaldoAwal(sheets: any, spreadsheetId: string, user: string, bulan: string) {

  const bulanMap: any = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
  }

  let year = new Date().getFullYear()
  let monthIndex = bulanMap[bulan] - 1

  if (monthIndex < 0) {
    monthIndex = 11
    year -= 1
  }

  const saldo = { spso: 0, npp: 0, ntp: 0 }

  const sameMonth = (tgl: string) => {
    const d = new Date(tgl)
    return d.getFullYear() === year && d.getMonth() === monthIndex
  }

  // TERIMA
  const terima = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `sk_terima!A2:E`
  })

  ;(terima.data.values || []).forEach((r: any[]) => {
    const tgl = r[0]
    const nama = (r[2] || '').toLowerCase().trim()
    const jenis = (r[3] || '').toLowerCase().trim()
    const jumlah = Number(r[4] || 0)

    if (!tgl || nama !== user || !sameMonth(tgl)) return

    if (jenis === 'spso') saldo.spso += jumlah
    if (jenis === 'npp') saldo.npp += jumlah
    if (jenis === 'ntp') saldo.ntp += jumlah
  })

  // KEMBALI
  const kembali = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `data_input!A2:F`
  })

  ;(kembali.data.values || []).forEach((r: any[]) => {
    const tgl = r[0]
    const nama = (r[2] || '').toLowerCase().trim()
    const jenis = (r[3] || '').toLowerCase().trim()
    const jumlah = Number(r[4] || 0)

    if (!tgl || nama !== user || !sameMonth(tgl)) return

    if (jenis === 'spso') saldo.spso -= jumlah
    if (jenis === 'npp') saldo.npp -= jumlah
    if (jenis === 'ntp') saldo.ntp -= jumlah
  })

  return saldo
}

// =========================
// MAIN HANDLER
// =========================
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

    const tahun = new Date().getFullYear()
    const monthIndex = getMonthIndex(String(bulan))

    const map: any = {}

    // =========================
    // INIT SEMUA TANGGAL
    // =========================

    const daysInMonth = new Date(tahun, monthIndex + 1, 0).getDate()

    for (let i = 1; i <= daysInMonth; i++) {
      const raw = `${tahun}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

      map[raw] = {
        tanggal: formatTanggal(raw),
        tanggal_raw: raw,
        terima: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
        kembali: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
        sisa: { spso: 0, npp: 0, ntp: 0, jumlah: 0 }
      }
    }

    // =========================
    // SK TERIMA (HARIAN)
    // =========================

    const terimaRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `sk_terima!A2:E`
    })

    ;(terimaRes.data.values || []).forEach((row: any[]) => {

      const raw = normalizeDate(row[0])
      const nama = (row[2] || '').toLowerCase().trim()
      const jenis = (row[3] || '').toLowerCase().trim()
      const jumlah = Number(row[4] || 0)

      if (!raw || nama !== user || !map[raw]) return

      const d = new Date(raw)
      if (d.getFullYear() !== tahun || d.getMonth() !== monthIndex) return

      if (jenis === 'spso') map[raw].terima.spso += jumlah
      if (jenis === 'npp') map[raw].terima.npp += jumlah
      if (jenis === 'ntp') map[raw].terima.ntp += jumlah
    })

    // =========================
    // SK KEMBALI (HARIAN)
    // =========================

    const kembaliRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `data_input!A2:F`
    })

    ;(kembaliRes.data.values || []).forEach((row: any[]) => {

      const raw = normalizeDate(row[0])
      const nama = (row[2] || '').toLowerCase().trim()
      const jenis = (row[3] || '').toLowerCase().trim()
      const jumlah = Number(row[4] || 0)

      if (!raw || nama !== user || !map[raw]) return

      const d = new Date(raw)
      if (d.getFullYear() !== tahun || d.getMonth() !== monthIndex) return

      if (jenis === 'spso') map[raw].kembali.spso += jumlah
      if (jenis === 'npp') map[raw].kembali.npp += jumlah
      if (jenis === 'ntp') map[raw].kembali.ntp += jumlah
    })

    // =========================
    // TOTAL HARIAN
    // =========================

    Object.values(map).forEach((item: any) => {
      item.terima.jumlah = item.terima.spso + item.terima.npp + item.terima.ntp
      item.kembali.jumlah = item.kembali.spso + item.kembali.npp + item.kembali.ntp
    })

    // =========================
    // SORT
    // =========================

    const sorted: any = Object.values(map).sort((a: any, b: any) =>
      new Date(a.tanggal_raw).getTime() - new Date(b.tanggal_raw).getTime()
    )

    // =========================
    // SALDO AWAL
    // =========================

    const saldoAwal = await getSaldoAwal(
      sheets,
      config.spreadsheetId,
      user,
      String(bulan)
    )

    // =========================
    // RUNNING SISA (FINAL BENAR)
    // =========================

    let prev = { ...saldoAwal }

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

  } catch (error: any) {

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Server Error'
    })

  }

})