<template>

  <div class="p-0">

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- ===================== -->
      <!-- TABEL DATA -->
      <!-- ===================== -->
      <div class="lg:col-span-9 order-2 lg:order-1">

        <div class="card bg-base-100 shadow-xl">

          <div class="card-body">

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-center">
              <!-- Title - HAPUS card-title margin -->
              <h2 class="font-bold text-xl m-0 p-0 text-base-content">
                Data {{ selectedMonth }} {{ selectedYear }}
              </h2>

              <!-- Dropdowns -->
              <div class="flex gap-2 justify-end">
                <select v-model="selectedMonth" @change="fetchData" class="select select-bordered select-sm">
                  <option v-for="bulan in months" :key="bulan" :value="bulan">{{ bulan }}</option>
                </select>
                <select v-model="selectedYear" @change="fetchData" class="select select-bordered select-sm">
                  <option v-for="tahun in availableYears" :key="tahun" :value="tahun">{{ tahun }}</option>
                </select>
              </div>
            </div>

            <div class="overflow-x-auto max-h-[600px] overflow-y-auto rounded-lg p-0">

              <table class="table text-center min-w-[900px] text-xs">

                <thead class="sticky top-0 z-30 text-white">

                  <tr>

                    <th rowspan="2" class="w-[140px] bg-base-300 text-base-content text-sm sticky left-0 top-0 z-[40]">
                      Tanggal
                    </th>

                    <th colspan="4" class="bg-success">
                      SK Terima
                    </th>

                    <th colspan="4" class="bg-info">
                      SK Kembali
                    </th>

                    <th colspan="4" class="bg-error">
                      Sisa SK
                    </th>

                  </tr>

                  <tr>

                    <th class="bg-success">SPSO</th>
                    <th class="bg-success">NPP</th>
                    <th class="bg-success">NTP</th>
                    <th class="bg-success">Jumlah</th>

                    <th class="bg-info">SPSO</th>
                    <th class="bg-info">NPP</th>
                    <th class="bg-info">NTP</th>
                    <th class="bg-info">Jumlah</th>

                    <th class="bg-error">SPSO</th>
                    <th class="bg-error">NPP</th>
                    <th class="bg-error">NTP</th>
                    <th class="bg-error">Jumlah</th>

                  </tr>

                </thead>

                <tbody>

                  <!-- <tr v-for="(row, index) in rows" :key="index" class="hover:bg-base-200 transition duration-200"> -->
                  <tr v-for="(row, index) in rows" :key="index" :class="[
                    'transition duration-200',
                    isHoliday(row.tanggal_raw)
                      ? 'bg-red-50'
                      : 'hover:bg-base-200'
                  ]">

                    <td :class="[
                      'sticky left-0 z-10 text-xs font-medium break-words whitespace-normal lg:whitespace-nowrap',
                      isHoliday(row.tanggal_raw)
                        ? 'bg-red-200 text-red-800 font-bold'
                        : 'bg-base-200'
                    ]">
                      {{ row.tanggal }}
                    </td>

                    <!-- SK TERIMA -->
                    <td class="bg-green-100">{{ row.terima.spso }}</td>
                    <td class="bg-green-100">{{ row.terima.npp }}</td>
                    <td class="bg-green-100">{{ row.terima.ntp }}</td>
                    <td class="bg-green-200 font-semibold">{{ row.terima.jumlah }}</td>

                    <!-- SK KEMBALI -->
                    <td class="bg-blue-100">{{ row.kembali.spso }}</td>
                    <td class="bg-blue-100">{{ row.kembali.npp }}</td>
                    <td class="bg-blue-100">{{ row.kembali.ntp }}</td>
                    <td class="bg-blue-200 font-semibold">{{ row.kembali.jumlah }}</td>

                    <!-- SISA -->
                    <td :class="[
                      'bg-red-100',
                      row.sisa.spso < 0 ? 'text-error font-bold' : ''
                    ]">
                      {{ row.sisa.spso }}
                    </td>

                    <td :class="[
                      'bg-red-100',
                      row.sisa.npp < 0 ? 'text-error font-bold' : ''
                    ]">
                      {{ row.sisa.npp }}
                    </td>

                    <td :class="[
                      'bg-red-100',
                      row.sisa.ntp < 0 ? 'text-error font-bold' : ''
                    ]">
                      {{ row.sisa.ntp }}
                    </td>

                    <td :class="[
                      'bg-red-200 font-semibold',
                      row.sisa.jumlah < 0 ? 'text-error font-bold' : ''
                    ]">
                      {{ row.sisa.jumlah }}
                    </td>

                  </tr>

                </tbody>

                <tfoot class="sticky bottom-0 z-10 font-bold bg-base-300">

                  <tr>

                    <td>TOTAL</td>

                    <td>{{ totalTerima.spso }}</td>
                    <td>{{ totalTerima.npp }}</td>
                    <td>{{ totalTerima.ntp }}</td>
                    <td>{{ totalTerima.jumlah }}</td>

                    <td>{{ totalKembali.spso }}</td>
                    <td>{{ totalKembali.npp }}</td>
                    <td>{{ totalKembali.ntp }}</td>
                    <td>{{ totalKembali.jumlah }}</td>

                    <td>{{ totalSisa.spso }}</td>
                    <td>{{ totalSisa.npp }}</td>
                    <td>{{ totalSisa.ntp }}</td>
                    <td class="text-error">{{ totalSisa.jumlah }}</td>

                  </tr>

                </tfoot>

              </table>

            </div>

          </div>

        </div>

      </div>

      <!-- ===================== -->
      <!-- FORM INPUT -->
      <!-- ===================== -->
      <div class="lg:col-span-3 order-1 lg:order-2">

        <div class="card bg-base-100 shadow-xl">

          <div class="card-body">

            <h2 class="card-title mb-4">
              Input Data
            </h2>

            <form @submit.prevent="submitForm" class="space-y-4">

              <div class="form-control">

                <label class="label">
                  <span class="label-text">Nama</span>
                </label>

                <input type="text" v-model="form.nama" class="input input-bordered w-full bg-base-200" readonly />

              </div>

              <div class="form-control">

                <label class="label">
                  <span class="label-text">Tanggal</span>
                </label>

                <input type="date" v-model="form.tanggal" :class="[
                  'input input-bordered w-full',
                  isHoliday(form.tanggal)
                    ? 'bg-red-100 text-red-700 font-semibold'
                    : ''
                ]" required />

                <p v-if="isHoliday(form.tanggal)" class="text-red-500 text-xs mt-1">
                  ⚠️ Tanggal yang dipilih adalah hari libur
                </p>

              </div>

              <div class="form-control">

                <label class="label">
                  <span class="label-text">Jenis SK</span>
                </label>

                <select v-model="form.jenisSurat" class="select select-bordered w-full" required>

                  <option value="" disabled>
                    Pilih jenis
                  </option>

                  <option v-for="item in jenisSuratOptions" :key="item" :value="item">
                    {{ item }}
                  </option>

                </select>

              </div>

              <div class="form-control">

                <label class="label">
                  <span class="label-text">Jumlah</span>
                </label>

                <input type="number" v-model="form.jumlah" min="1" class="input input-bordered w-full" required />

              </div>

              <button type="submit" class="btn btn-primary w-full mt-4" :disabled="isSubmitting">

                <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>

                {{ isSubmitting ? 'Mengirim...' : 'Submit Data' }}

              </button>

            </form>

          </div>

        </div>

      </div>

    </div>

    <!-- Notifikasi Submit Data -->
    <div v-if="notification.show" class="fixed inset-0 flex items-center justify-center z-50">

      <div class="alert shadow-xl w-[420px] text-lg p-6" :class="{
        'alert-success': notification.type === 'success',
        'alert-error': notification.type === 'error',
        'alert-info': notification.type === 'info'
      }">

        <span class="font-semibold text-center w-full">
          {{ notification.message }}
        </span>

      </div>

    </div>

  </div>

</template>

<script setup lang="ts">

import { ref, onMounted, computed } from 'vue'
import { useUser } from '~/composables/useUser'

definePageMeta({
  middleware: 'auth'
})

const { userNama } = useUser()

const rows = ref<any[]>([])

const form = ref({
  nama: '',
  tanggal: '',
  jenisSurat: '',
  jumlah: 1
})

const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

const selectedMonth = ref("")
const selectedYear = ref(2026)
const currentYear = ref(new Date().getFullYear())

const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const showNotification = (type: string, message: string) => {
  notification.value = {
    show: true,
    type,
    message
  }

  setTimeout(() => {
    notification.value.show = false
  }, 750)
}

const showWarning = (type: string, message: string) => {
  notification.value = {
    show: true,
    type,
    message
  }

  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

// Auto-set bulan berjalan
const currentMonthIndex = new Date().getMonth() // 0=Januari
// GANTI/UPDATE BAGIAN INI SAJA:
const now = new Date()
const previousMonth = (now.getMonth() + 11) % 12
const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

// Filter
selectedMonth.value = months[previousMonth]
selectedYear.value = previousYear

// Form tanggal default: 1 bulan lalu
form.value.tanggal = `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}-01`

// Generate tahun available (2026 - sekarang + 2 tahun ke depan)
const availableYears = computed(() => {
  const years = []
  const startYear = 2026
  const endYear = currentYear.value + 2

  for (let year = startYear; year <= endYear; year++) {
    years.push(year)
  }
  return years
})

// Helper extract bulan dari tanggal
const getMonthNameFromDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00') // Pastikan valid date
  return months[Math.floor(date.getMonth())]
}

const jenisSuratOptions = ref(['SPSO', 'NPP', 'NTP'])

const isSubmitting = ref(false)

onMounted(() => {
  form.value.nama = userNama?.value || ''
  fetchData()
})

const fetchData = async () => {

  try {

    const data: any = await $fetch('/api/hasil_dinas', {
      query: { bulan: selectedMonth.value.toLowerCase() }
    })

    rows.value = data

  } catch (err) {

    console.error('Gagal mengambil data', err)

  }

}

const totalTerima = computed(() => {

  return rows.value.reduce((acc: any, item: any) => {

    acc.spso += Number(item.terima?.spso || 0)
    acc.npp += Number(item.terima?.npp || 0)
    acc.ntp += Number(item.terima?.ntp || 0)
    acc.jumlah += Number(item.terima?.jumlah || 0)

    return acc

  }, { spso: 0, npp: 0, ntp: 0, jumlah: 0 })

})

const totalKembali = computed(() => {

  return rows.value.reduce((acc: any, item: any) => {

    acc.spso += Number(item.kembali?.spso || 0)
    acc.npp += Number(item.kembali?.npp || 0)
    acc.ntp += Number(item.kembali?.ntp || 0)
    acc.jumlah += Number(item.kembali?.jumlah || 0)

    return acc

  }, { spso: 0, npp: 0, ntp: 0, jumlah: 0 })

})

const totalSisa = computed(() => {

  if (!rows.value.length) {
    return { spso: 0, npp: 0, ntp: 0, jumlah: 0 }
  }

  const last = rows.value[rows.value.length - 1]

  return {
    spso: Number(last.sisa?.spso || 0),
    npp: Number(last.sisa?.npp || 0),
    ntp: Number(last.sisa?.ntp || 0),
    jumlah: Number(last.sisa?.jumlah || 0)
  }

})

// Update submitForm dengan validasi bulan & tahun
const submitForm = async () => {
  // Validasi bulan & tahun
  if (form.value.tanggal && form.value.jenisSurat) {
    const inputDate = new Date(form.value.tanggal + 'T00:00:00')
    const inputMonth = months[Math.floor(inputDate.getMonth())]
    const inputYear = inputDate.getFullYear()

    // Cek bulan
    if (inputMonth !== selectedMonth.value) {
      showWarning('error',
        `❌ Bulan tidak sesuai!\n` +
        `Filter: ${selectedMonth.value} ${selectedYear.value}\n` +
        `Input: ${inputMonth} ${inputYear}\n\n` +
        `Ubah filter bulan ke "${inputMonth}" dulu!`
      )
      return
    }

    // Cek tahun
    if (inputYear !== selectedYear.value) {
      showWarning('error',
        `❌ Tahun tidak sesuai!\n` +
        `Filter: ${selectedMonth.value} ${selectedYear.value}\n` +
        `Input: ${inputMonth} ${inputYear}\n\n` +
        `Ubah filter tahun ke "${inputYear}" dulu!`
      )
      return
    }
  }

  // Validasi form lain
  if (!form.value.tanggal || !form.value.jenisSurat || !form.value.jumlah) {
    showNotification('error', 'Semua field wajib diisi!')
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/inputDinas', {
      method: 'POST',
      body: {
        ...form.value,
        tahun: selectedYear.value, // Kirim tahun juga ke API
        bulan: selectedMonth.value.toLowerCase()
      }
    })

    // Reset form (keep tanggal biar user lanjut input)
    form.value.jenisSurat = ''
    form.value.jumlah = 1

    await fetchData()
    showNotification('success', '✅ Data berhasil disimpan!')

  } catch (err) {
    console.error(err)
    showNotification('error', '❌ Gagal menyimpan data')
  } finally {
    isSubmitting.value = false
  }
}

// =========================
// HARI LIBUR 2026
// =========================
const holidays: Record<number, string[]> = {
  2026: [
    '2026-01-01', // Tahun Baru
    '2026-01-16', // Isra Mikraj
    '2026-02-16', // Cuti Bersama Tahun Baru Imlek
    '2026-02-17', // Tahun Baru Imlek
    '2026-03-18', // Cuti Bersama Nyepi
    '2026-03-19', // Nyepi
    '2026-03-20', // Cuti Bersama Idul Fitri
    '2026-03-21', // Idul Fitri
    '2026-03-22', // Idul Fitri
    '2026-03-23', // Cuti Bersama Idul Fitri
    '2026-03-24', // Cuti Bersama Idul Fitri
    '2026-04-03', // Wafat Isa Almasih
    '2026-05-01', // Hari Buruh
    '2026-05-14', // Kenaikan Isa Almasih
    '2026-05-15', // Cuti Bersama Kenaikan Isa Almasih
    '2026-05-27', // Idul Adha
    '2026-05-28', // Cuti Bersama Idul Adha
    '2026-06-01', // Pancasila
    '2026-06-16', // Tahun Baru Islam
    '2026-08-17', // Hari Kemerdekaan
    '2026-08-25', // Maulid Nabi Muhammad
    '2026-12-24', // Cuti Bersama Natal
    '2026-12-25'  // Natal
  ]
}

// =========================
// CEK HARI LIBUR
// =========================
const isHoliday = (date: string) => {
  if (!date) return false

  const d = new Date(date)
  const year = d.getFullYear()

  // ❗ Minggu saja
  if (d.getDay() === 0) return true

  // ❗ Libur nasional
  if (holidays[year]?.includes(date)) return true

  return false
}

</script>