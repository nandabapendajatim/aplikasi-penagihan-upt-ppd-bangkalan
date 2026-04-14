<template>
    <div class="p-6 max-w-6xl mx-auto">
        <div class="bg-base-100 rounded-lg shadow-lg p-6 border border-base-200">

            <!-- Header -->
            <div class="flex flex-col items-center gap-4 mb-6">
                <h1 class="text-2xl font-bold">
                    📊 Laporan Rekap {{ selectedMonth }} {{ selectedYear }}
                </h1>

                <div class="flex gap-2 justify-end">
                    <select v-model="selectedMonth" @change="fetchData" class="select select-bordered select-sm w-32">
                        <option v-for="b in months" :key="b" :value="b">{{ b }}</option>
                    </select>

                    <select v-model="selectedYear" @change="fetchData" class="select select-bordered select-sm w-24">
                        <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
                    </select> &nbsp;
                    <!-- tombol -->
                    <button @click="downloadPdf" class="btn btn-error btn-sm">
                        PDF
                    </button>

                    <button @click="downloadExcel" class="btn btn-success btn-sm">
                        Excel
                    </button>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="table table-bordered w-full text-sm">

                    <thead>
                        <tr class="bg-base-200 text-center">
                            <th rowspan="2">No</th>
                            <th rowspan="2">Nama</th>
                            <th rowspan="2">Sisa<br />Lalu</th>
                            <th colspan="4">SK Terima</th>
                            <th colspan="4">SK Kembali</th>
                            <th rowspan="2">Sisa<br />Akhir</th>
                        </tr>
                        <tr class="bg-base-200 text-center">
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

                    <tbody class="text-center">
                        <tr v-for="(row, i) in rows" :key="i">
                            <td class="font-medium">{{ i + 1 }}</td>
                            <td class="text-left font-medium">{{ row.nama }}</td>
                            <td class="font-semibold">{{ row.sisa_lalu }}</td>

                            <td>{{ row.terima.spso }}</td>
                            <td>{{ row.terima.npp }}</td>
                            <td>{{ row.terima.ntp }}</td>
                            <td class="font-semibold">{{ row.terima.total }}</td>

                            <td>{{ row.kembali.spso }}</td>
                            <td>{{ row.kembali.npp }}</td>
                            <td>{{ row.kembali.ntp }}</td>
                            <td class="font-semibold">{{ row.kembali.total }}</td>

                            <td class="font-bold text-primary">{{ row.sisa }}</td>
                        </tr>

                        <!-- GRAND TOTAL -->
                        <tr class="bg-primary text-primary-content font-bold">
                            <td colspan="2" class="text-left">TOTAL SEMUA</td>
                            <td>{{ grand.sisa_lalu || 0 }}</td>
                            <td colspan="3"></td>
                            <td>{{ grand.terima?.total || 0 }}</td>
                            <td colspan="3"></td>
                            <td>{{ grand.kembali?.total || 0 }}</td>
                            <td>{{ grand.sisa || 0 }}</td>
                        </tr>
                    </tbody>

                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
const rows = ref([])
const grand = ref({})

const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const now = new Date()

// 🔥 default bulan lalu
const selectedMonth = ref(months[(now.getMonth() + 11) % 12])
const selectedYear = ref(
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
)

const availableYears = [2024, 2025, 2026]

const fetchData = async () => {
    try {
        const res = await $fetch('/api/laporan/rekap', {
            params: {
                bulan: selectedMonth.value,
                tahun: selectedYear.value
            }
        })

        rows.value = res.data || []
        grand.value = res.grand || {}

    } catch (err) {
        console.error(err)
        alert('Gagal ambil data rekap')
    }
}

onMounted(fetchData)

const downloadPdf = () => {
  window.open(`/api/laporan/rekap?bulan=${selectedMonth.value}&tahun=${selectedYear.value}&type=pdf`)
}

const downloadExcel = () => {
  window.open(`/api/laporan/rekap?bulan=${selectedMonth.value}&tahun=${selectedYear.value}&type=excel`)
}
</script>