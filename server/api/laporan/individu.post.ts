import { getGoogleSheets } from '../../utils/google'
import { getCookie, getRequestHeader, readBody, setHeader, createError } from 'h3'
import chromium from '@sparticuz/chromium'

export default defineEventHandler(async (event) => {
  // ✅ PUPPETEER INIT (NO TOP-LEVEL AWAIT)
  const initPuppeteer = async () => {
    const isProduction = process.env.NODE_ENV === 'production'

    let puppeteer;
    if (isProduction) {
      puppeteer = (await import('puppeteer-core')).default;
    } else {
      puppeteer = (await import('puppeteer')).default;
    }

    return {
      puppeteer,
      isProduction,
      chromium
    }
  }

  try {
    const { puppeteer, isProduction, chromium } = await initPuppeteer()

    const body = await readBody(event)
    const { startDate, endDate } = body

    const namaUser = getCookie(event, 'nama') || ''
    if (!namaUser) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const namaSeksi = getCookie(event, 'seksi') || ''
    const user = namaUser.toLowerCase().trim()
    const seksi = namaSeksi.toLowerCase().trim()

    const truncateName = (nama: string, maxWords: number = 2): string => {
      if (!nama) return ''
      const words = nama.trim().split(/\s+/)
      if (words.length <= maxWords) return nama
      return words.slice(0, maxWords).join(' ')
    }

    const config = useRuntimeConfig()
    const sheets = getGoogleSheets()

    // =========================
    // HELPER
    // =========================
    const normalize = (d: string) => {
      const x = new Date(d)
      return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
    }

    const formatTanggal = (d: string) => {
      const hari = [
        'Minggu', 'Senin', 'Selasa', 'Rabu',
        'Kamis', 'Jumat', 'Sabtu'
      ]

      const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ]

      const x = new Date(d)

      return `${hari[x.getDay()]}, ${x.getDate()} ${bulan[x.getMonth()]} ${x.getFullYear()}`
    }

    // =========================
    // AMBIL DATA
    // =========================
    const terimaRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `sk_terima!A2:E`
    })

    const kembaliRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `data_input!A2:F`
    })

    const map: any = {}

      // =========================
      // TERIMA
      // =========================
      ; (terimaRes.data.values || []).forEach((r: any[]) => {
        const raw = normalize(r[0])
        const nama = (r[2] || '').toLowerCase().trim()
        const jenis = (r[3] || '').toLowerCase().trim()
        const jumlah = Number(r[4] || 0)

        if (nama !== user) return
        if (raw < startDate || raw > endDate) return

        if (!map[raw]) {
          map[raw] = {
            tanggal: raw,
            terima: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
            kembali: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
            sisa: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
            sisa_lalu: { spso: 0, npp: 0, ntp: 0, jumlah: 0 }
          }
        }

        if (jenis === 'spso') map[raw].terima.spso += jumlah
        if (jenis === 'npp') map[raw].terima.npp += jumlah
        if (jenis === 'ntp') map[raw].terima.ntp += jumlah
      })

      // =========================
      // KEMBALI
      // =========================
      ; (kembaliRes.data.values || []).forEach((r: any[]) => {
        const raw = normalize(r[0])
        const nama = (r[2] || '').toLowerCase().trim()
        const jenis = (r[3] || '').toLowerCase().trim()
        const jumlah = Number(r[4] || 0)

        if (nama !== user) return
        if (raw < startDate || raw > endDate) return

        if (!map[raw]) {
          map[raw] = {
            tanggal: raw,
            terima: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
            kembali: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
            sisa: { spso: 0, npp: 0, ntp: 0, jumlah: 0 },
            sisa_lalu: { spso: 0, npp: 0, ntp: 0, jumlah: 0 }
          }
        }

        if (jenis === 'spso') map[raw].kembali.spso += jumlah
        if (jenis === 'npp') map[raw].kembali.npp += jumlah
        if (jenis === 'ntp') map[raw].kembali.ntp += jumlah
      })

    // =========================
    // SORT + HITUNG
    // =========================
    let prev = { spso: 0, npp: 0, ntp: 0 }

    const sorted = Object.values(map)
      .sort((a: any, b: any) =>
        new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
      )

    sorted.forEach((item: any) => {
      item.tanggal_format = formatTanggal(item.tanggal)

      item.terima.jumlah =
        item.terima.spso +
        item.terima.npp +
        item.terima.ntp

      item.kembali.jumlah =
        item.kembali.spso +
        item.kembali.npp +
        item.kembali.ntp

      item.sisa_lalu = {
        spso: prev.spso,
        npp: prev.npp,
        ntp: prev.ntp,
        jumlah: prev.spso + prev.npp + prev.ntp
      }

      item.sisa.spso = prev.spso + item.terima.spso - item.kembali.spso
      item.sisa.npp = prev.npp + item.terima.npp - item.kembali.npp
      item.sisa.ntp = prev.ntp + item.terima.ntp - item.kembali.ntp

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

    const host = getRequestHeader(event, 'host')
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`

    // =========================
    // HTML RENDER
    // =========================
    function renderItem(item: any) {

      const totalSK = {
        spso: item.terima.spso + item.sisa_lalu.spso,
        npp: item.terima.npp + item.sisa_lalu.npp,
        ntp: item.terima.ntp + item.sisa_lalu.ntp,
        jumlah: item.terima.jumlah + item.sisa_lalu.jumlah
      }

      // Hitung sisa SK saat ini (Total SK - Kembali)
      const sisaSK = {
        spso: totalSK.spso - item.kembali.spso,
        npp: totalSK.npp - item.kembali.npp,
        ntp: totalSK.ntp - item.kembali.ntp,
        jumlah: totalSK.jumlah - item.kembali.jumlah
      }

      return `
        <div class="laporan">

          <table style="border:none;border-collapse:collapse;font-size:16px;font-weight:bold" width="100%">
            <tr>
              <td style="border:none;text-align:center" width="20%"><img src="${baseUrl}/logo-kantor.png" width="55" /></td>
              <td style="border:none;text-align:center" width="60%">UNIT PELAKSANA TEKNIS <br> PENGELOLAAN PENDAPATAN DEARAH BANGKALAN</td>
              <td style="border:none;text-align:center" width="20%"></td>
            </tr>
            <tr>
              <td style="border:none;text-align:center" width="20%"></td>
              <td style="border:none;text-align:center" width="60%">FORMULIR LAPORAN HASIL DINAS LUAR</td>
              <td style="border:none;text-align:center" width="20%"></td>
            </tr>
          </table>
          
          <table style="border:none;border-collapse:collapse;font-size:14px" width="100%">
            <tr>
              <td style="border:none;text-align:left" width="15%">NAMA</td>
              <td style="border:none" width="5%">:</td><td style="border:none;text-align:left" width="80%">${namaUser}</td>
              
            </tr>
            <tr>
              <td style="border:none;text-align:left">HARI/TANGGAL</td>
              <td style="border:none">:</td>
              <td style="border:none;text-align:left">${item.tanggal_format}</td>
            </tr>
            <tr>
              <td style="border:none;text-align:left">SEKSI/BAGIAN</td>
              <td style="border:none">:</td>
              <td style="border:none;text-align:left">${namaSeksi}</td>
            </tr>
          </table>

          <table style="font-size:14px">
            <tr>
              <th>URAIAN</th><th>SPSO</th><th>NPP</th><th>NTP</th><th>JUMLAH</th>
            </tr>
            <tr>
              <td class="text-left">SK Terima</td>
              <td>${item.terima.spso}</td>
              <td>${item.terima.npp}</td>
              <td>${item.terima.ntp}</td>
              <td>${item.terima.jumlah}</td>
            </tr>
            <tr>
              <td class="text-left">Sisa SK Lalu</td>
              <td>${item.sisa_lalu.spso}</td>
              <td>${item.sisa_lalu.npp}</td>
              <td>${item.sisa_lalu.ntp}</td>
              <td>${item.sisa_lalu.jumlah}</td>
            </tr>
            <tr style="font-weight: bold; background-color: #f0f0f0;">
              <td class="text-right">TOTAL SK</td>
              <td>${totalSK.spso}</td>
              <td>${totalSK.npp}</td>
              <td>${totalSK.ntp}</td>
              <td>${totalSK.jumlah}</td>
            </tr>
          </table>

          <br/>

          <table style="font-size:14px">
            <tr>
              <th>STATUS</th><th>SPSO</th><th>NPP</th><th>NTP</th><th>JUMLAH</th>
            </tr>

            <tr><td class="text-left">Masih Dimiliki</td><td></td><td></td><td></td><td></td></tr>
            <tr><td class="text-left">Lapor Jual</td><td></td><td></td><td></td><td></td></tr>
            <tr><td class="text-left">Alamat Tidak Jelas</td><td></td><td></td><td></td><td></td></tr>
            <tr><td class="text-left">Rusak/Hilang</td><td></td><td></td><td></td><td></td></tr>
            <tr><td class="text-left">Lain-lain</td><td></td><td></td><td></td><td></td></tr>

            <tr style="font-weight: bold; background-color: #f0f0f0;" >
              <td class="text-right"><b>TOTAL SK</b></td>
              <td>${item.kembali.spso}</td>
              <td>${item.kembali.npp}</td>
              <td>${item.kembali.ntp}</td>
              <td>${item.kembali.jumlah}</td>
            </tr>
            <tr style="font-weight: bold; background-color: #e6f3ff;">
              <td class="text-right">SISA SK SAAT INI</td>
              <td>${sisaSK.spso}</td>
              <td>${sisaSK.npp}</td>
              <td>${sisaSK.ntp}</td>
              <td>${sisaSK.jumlah}</td>
            </tr>
          </table>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 5px;">
            <div style="font-size:12px; padding-top: 4px;">Keterangan :</div>
            
            <div class="ttd" style="text-align: right;">
              <p style="font-size:12px; margin: 0;">Petugas Dinas Luar</p><br/>
              <div style="font-size:12px" class="ttd-box">(${truncateName(namaUser)})</div>
            </div>
          </div>
        </div>
      `
    }

    function generateHTML(data: any[]) {
      let html = ''

      for (let i = 0; i < data.length; i += 2) {
        html += `
          <div class="page">
            ${renderItem(data[i])}
            ${data[i + 1] ? renderItem(data[i + 1]) : ''}
          </div>
        `
      }

      return html
    }

    // =========================
    // PDF
    // =========================
    const browser = await puppeteer.launch(
      isProduction
        ? {
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true
        }
        : {
          headless: true,
          executablePath: undefined // 🔥 penting biar pakai default local chrome
        }
    )
    const page = await browser.newPage()

    await page.setContent(`
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

        body {
          font-family: 'Roboto', Arial, sans-serif;
          margin: 0;
        }

        .page {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .laporan {
          min-height: 48%;
          padding: 10px 20px;
          padding-left: 80px; /* khusus jilid */
          border-bottom: 1px dashed black;
          box-sizing: border-box;
          page-break-inside: avoid;
        }

        .laporan:last-child { border-bottom: none; }

        table { width: 100%; border-collapse: collapse; margin-top: 4px; }

        th, td { border: 1px solid black; padding: 3px; text-align: center; }

        .text-left { text-align: left; }

        .ttd { margin-top: 5px; text-align: right; }

        .ttd-box { margin-top: 15px; }
      </style>

      ${generateHTML(sorted)}
    `)

    await page.evaluateHandle('document.fonts.ready')

    const pdf = await page.pdf({
      // format: 'A4',
      width: '215mm',
      height: '330mm',
      printBackground: true
    })

    await browser.close()

    setHeader(event, 'Content-Type', 'application/pdf')
    return pdf

  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message
    })
  }
})