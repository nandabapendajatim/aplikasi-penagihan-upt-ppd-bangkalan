import { getGoogleSheets } from '../../utils/google'
import { getQuery, createError, setHeader } from 'h3'
import chromium from '@sparticuz/chromium'
import ExcelJS from 'exceljs'

// =========================
// NORMALIZE
// =========================
const normalize = (d: string) => {
  if (!d) return ''
  const x = new Date(d)
  if (isNaN(x.getTime())) return ''
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

// =========================
// MAP BULAN
// =========================
const getMonthIndex = (bulan: string) => {
  const map: any = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
  }
  return map[bulan.toLowerCase()]
}

// =========================
// INIT USER
// =========================
const initUser = (nama: string) => ({
  nama,
  sisa_lalu: 0,
  terima: { spso: 0, npp: 0, ntp: 0, total: 0 },
  kembali: { spso: 0, npp: 0, ntp: 0, total: 0 },
  sisa: 0
})

// =========================
// MAIN
// =========================
export default defineEventHandler(async (event) => {
  try {
    const { bulan, tahun, type } = getQuery(event)

    if (!bulan || !tahun) {
      throw createError({ statusCode: 400, statusMessage: 'Bulan & tahun wajib' })
    }

    const monthIndex = getMonthIndex(String(bulan))
    const year = Number(tahun)

    const config = useRuntimeConfig()
    const sheets = getGoogleSheets()

    const terimaRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `sk_terima!A2:E`
    })

    const kembaliRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
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

      // =========================
      // TERIMA
      // =========================
      ; (terimaRes.data.values || []).forEach((r: any[]) => {
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

      // =========================
      // KEMBALI
      // =========================
      ; (kembaliRes.data.values || []).forEach((r: any[]) => {
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
      terima: { total: 0 },
      kembali: { total: 0 },
      sisa: 0
    }

    Object.values(map).forEach((item: any) => {
      item.terima.total = item.terima.spso + item.terima.npp + item.terima.ntp
      item.kembali.total = item.kembali.spso + item.kembali.npp + item.kembali.ntp
      item.sisa = item.sisa_lalu + item.terima.total - item.kembali.total

      grand.sisa_lalu += item.sisa_lalu
      grand.terima.total += item.terima.total
      grand.kembali.total += item.kembali.total
      grand.sisa += item.sisa

      result.push(item)
    })

    result.sort((a, b) => a.nama.localeCompare(b.nama))

    // =========================
    // JSON
    // =========================
    if (!type || type === 'json') {
      return { data: result, grand }
    }

    // =========================
    // PDF
    // =========================
    if (type === 'pdf') {
      const isProduction = process.env.NODE_ENV === 'production'

      let browser

      if (isProduction) {
        // ✅ VERCEL
        const puppeteer = (await import('puppeteer-core')).default

        browser = await puppeteer.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true
        })

      } else {
        // ✅ LOCAL
        const puppeteer = (await import('puppeteer')).default

        browser = await puppeteer.launch({
          headless: true
        })
      }

      const page = await browser.newPage()

      const html = `
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              padding: 20px;
            }

            h2 {
              text-align: center;
              margin-bottom: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid black;
              padding: 4px;
              text-align: center;
            }

            th {
              background: #eee;
              font-weight: bold;
            }

            .left {
              text-align: left;
            }

            .bold {
              font-weight: bold;
            }

            .total {
              background: #ddd;
              font-weight: bold;
            }
          </style>
        </head>
        <body>

          <h2>Laporan Rekap ${bulan} ${tahun}</h2>

          <table>
            <thead>
              <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Nama</th>
                <th rowspan="2">Sisa Lalu</th>
                <th colspan="4">SK Terima</th>
                <th colspan="4">SK Kembali</th>
                <th rowspan="2">Sisa Akhir</th>
              </tr>
              <tr>
                <th>SPSO</th>
                <th>NPP</th>
                <th>NTP</th>
                <th>Total</th>
                <th>SPSO</th>
                <th>NPP</th>
                <th>NTP</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              ${result.map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td class="left">${r.nama}</td>
                  <td>${r.sisa_lalu}</td>

                  <td>${r.terima.spso}</td>
                  <td>${r.terima.npp}</td>
                  <td>${r.terima.ntp}</td>
                  <td class="bold">${r.terima.total}</td>

                  <td>${r.kembali.spso}</td>
                  <td>${r.kembali.npp}</td>
                  <td>${r.kembali.ntp}</td>
                  <td class="bold">${r.kembali.total}</td>

                  <td class="bold">${r.sisa}</td>
                </tr>
              `).join('')}

              <!-- GRAND TOTAL -->
              <tr class="total">
                <td colspan="2" class="left">TOTAL</td>
                <td>${grand.sisa_lalu}</td>

                <td colspan="3"></td>
                <td>${grand.terima.total}</td>

                <td colspan="3"></td>
                <td>${grand.kembali.total}</td>

                <td>${grand.sisa}</td>
              </tr>

            </tbody>
          </table>

        </body>
        </html>
        `

      await page.setContent(html)

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px'
        }
      })  
      await browser.close()

      setHeader(event, 'Content-Type', 'application/pdf')
      return pdf
    }

    // =========================
    // EXCEL
    // =========================
    if (type === 'excel') {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Rekap')

      // =========================
      // HEADER (2 BARIS + MERGE)
      // =========================
      ws.addRow([
        'No',
        'Nama',
        'Sisa Lalu',
        'SK Terima', '', '', '',
        'SK Kembali', '', '', '',
        'Sisa Akhir'
      ])

      ws.addRow([
        '', '', '',
        'SPSO', 'NPP', 'NTP', 'Total',
        'SPSO', 'NPP', 'NTP', 'Total',
        ''
      ])

      // MERGE HEADER
      ws.mergeCells('A1:A2')
      ws.mergeCells('B1:B2')
      ws.mergeCells('C1:C2')
      ws.mergeCells('D1:G1')
      ws.mergeCells('H1:K1')
      ws.mergeCells('L1:L2')

      // =========================
      // STYLE HEADER
      // =========================
      const headerRows = [1, 2]
      headerRows.forEach(rowNum => {
        ws.getRow(rowNum).eachCell(cell => {
          cell.font = { bold: true }
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
      })

      // =========================
      // DATA
      // =========================
      result.forEach((r, i) => {
        const row = ws.addRow([
          i + 1,
          r.nama,
          r.sisa_lalu,

          r.terima.spso,
          r.terima.npp,
          r.terima.ntp,
          r.terima.total,

          r.kembali.spso,
          r.kembali.npp,
          r.kembali.ntp,
          r.kembali.total,

          r.sisa
        ])

        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
        })

        // Nama rata kiri
        row.getCell(2).alignment = { horizontal: 'left' }
      })

      // =========================
      // GRAND TOTAL
      // =========================
      const totalRow = ws.addRow([
        '',
        'TOTAL',
        grand.sisa_lalu,

        '',
        '',
        '',
        grand.terima.total,

        '',
        '',
        '',
        grand.kembali.total,

        grand.sisa
      ])

      // merge kolom TOTAL
      ws.mergeCells(`A${totalRow.number}:B${totalRow.number}`)

      totalRow.eachCell(cell => {
        cell.font = { bold: true }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })

      totalRow.getCell(2).alignment = { horizontal: 'left' }

      // =========================
      // AUTO WIDTH
      // =========================
      ws.columns.forEach(col => {
        col.width = 15
      })

      // =========================
      // EXPORT
      // =========================
      const buffer = await wb.xlsx.writeBuffer()

      setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      setHeader(event, 'Content-Disposition', `attachment; filename=rekap-${bulan}-${tahun}.xlsx`)

      return buffer
    }

  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message
    })
  }
})