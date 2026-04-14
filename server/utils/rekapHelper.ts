export const getMonthIndex = (bulan: string) => {
  const map: any = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
  }
  return map[bulan.toLowerCase()]
}

const normalize = (d: string) => {
  if (!d) return ''
  const x = new Date(d)
  if (isNaN(x.getTime())) return ''
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

const initUser = (nama: string) => ({
  nama,
  sisa_lalu: 0,
  terima: { spso: 0, npp: 0, ntp: 0, total: 0 },
  kembali: { spso: 0, npp: 0, ntp: 0, total: 0 },
  sisa: 0
})

export async function computeRekap({ bulan, tahun, sheets, spreadsheetId }: any) {

  const monthIndex = getMonthIndex(bulan)
  const year = Number(tahun)

  const terimaRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `sk_terima!A2:E`
  })

  const kembaliRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `data_input!A2:F`
  })

  const map: Record<string, any> = {}

  const isBeforeTarget = (tgl: string) => {
    const d = new Date(tgl)
    if (d.getFullYear() < year) return true
    if (d.getFullYear() === year && d.getMonth() < monthIndex) return true
    return false
  }

  const isCurrentMonth = (tgl: string) => {
    const d = new Date(tgl)
    return d.getFullYear() === year && d.getMonth() === monthIndex
  }

  // TERIMA
  ;(terimaRes.data.values || []).forEach((r: any[]) => {
    const tgl = normalize(r[0])
    const nama = (r[2] || '').trim()
    const jenis = (r[3] || '').toLowerCase().trim()
    const jumlah = Number(r[4] || 0)

    if (!tgl || !nama) return
    if (!map[nama]) map[nama] = initUser(nama)

    if (isBeforeTarget(tgl)) {
      map[nama].sisa_lalu += jumlah
    }

    if (isCurrentMonth(tgl)) {
      if (jenis === 'spso') map[nama].terima.spso += jumlah
      if (jenis === 'npp') map[nama].terima.npp += jumlah
      if (jenis === 'ntp') map[nama].terima.ntp += jumlah
    }
  })

  // KEMBALI
  ;(kembaliRes.data.values || []).forEach((r: any[]) => {
    const tgl = normalize(r[0])
    const nama = (r[2] || '').trim()
    const jenis = (r[3] || '').toLowerCase().trim()
    const jumlah = Number(r[4] || 0)

    if (!tgl || !nama) return
    if (!map[nama]) map[nama] = initUser(nama)

    if (isBeforeTarget(tgl)) {
      map[nama].sisa_lalu -= jumlah
    }

    if (isCurrentMonth(tgl)) {
      if (jenis === 'spso') map[nama].kembali.spso += jumlah
      if (jenis === 'npp') map[nama].kembali.npp += jumlah
      if (jenis === 'ntp') map[nama].kembali.ntp += jumlah
    }
  })

  const result: any[] = []

  const grand = {
    sisa_lalu: 0,
    terima: { spso: 0, npp: 0, ntp: 0, total: 0 },
    kembali: { spso: 0, npp: 0, ntp: 0, total: 0 },
    sisa: 0
  }

  Object.values(map).forEach((item: any) => {

    item.terima.total = item.terima.spso + item.terima.npp + item.terima.ntp
    item.kembali.total = item.kembali.spso + item.kembali.npp + item.kembali.ntp

    item.sisa = item.sisa_lalu + item.terima.total - item.kembali.total

    grand.sisa_lalu += item.sisa_lalu

    grand.terima.spso += item.terima.spso
    grand.terima.npp += item.terima.npp
    grand.terima.ntp += item.terima.ntp
    grand.terima.total += item.terima.total

    grand.kembali.spso += item.kembali.spso
    grand.kembali.npp += item.kembali.npp
    grand.kembali.ntp += item.kembali.ntp
    grand.kembali.total += item.kembali.total

    grand.sisa += item.sisa

    result.push(item)
  })

  result.sort((a, b) => a.nama.localeCompare(b.nama))

  return { data: result, grand }
}