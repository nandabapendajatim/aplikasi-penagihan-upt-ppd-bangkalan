import { getGoogleSheets } from '../utils/google'
import { getCookie } from 'h3'

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

        const targetMonth = bulanIndex(bulan)
        const tahun = new Date().getFullYear()

        const terimaTotal = { spso: 0, npp: 0, ntp: 0 }
        const kembaliTotal = { spso: 0, npp: 0, ntp: 0 }

        const chartMap: any = {}

        // ======================
        // SK TERIMA
        // ======================

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
            if (d.getMonth() !== targetMonth) return

            const hari = d.getDate()

            if (!chartMap[hari]) {
                chartMap[hari] = { terima: 0, kembali: 0 }
            }

            chartMap[hari].terima += jumlah

            if (jenis === 'spso') terimaTotal.spso += jumlah
            if (jenis === 'npp') terimaTotal.npp += jumlah
            if (jenis === 'ntp') terimaTotal.ntp += jumlah

        })


        // ======================
        // SK KEMBALI
        // ======================

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
            if (d.getMonth() !== targetMonth) return

            const hari = d.getDate()

            if (!chartMap[hari]) {
                chartMap[hari] = { terima: 0, kembali: 0 }
            }

            chartMap[hari].kembali += jumlah

            if (jenis === 'spso') kembaliTotal.spso += jumlah
            if (jenis === 'npp') kembaliTotal.npp += jumlah
            if (jenis === 'ntp') kembaliTotal.ntp += jumlah

        })


        // ======================
        // CHART
        // ======================

        const labels: string[] = []
        const terimaSeries: number[] = []
        const kembaliSeries: number[] = []

        Object.keys(chartMap)
            .sort((a, b) => Number(a) - Number(b))
            .forEach((h) => {

                labels.push(h)
                terimaSeries.push(chartMap[h].terima)
                kembaliSeries.push(chartMap[h].kembali)

            })


        const sisa = {
            spso: terimaTotal.spso - kembaliTotal.spso,
            npp: terimaTotal.npp - kembaliTotal.npp,
            ntp: terimaTotal.ntp - kembaliTotal.ntp
        }

        return {

            terima: terimaTotal,
            kembali: kembaliTotal,
            sisa,

            chart: {
                labels,
                terima: terimaSeries,
                kembali: kembaliSeries
            }

        }

    }

    catch (error: any) {

        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || error.message || 'Server Error'
        })

    }

})