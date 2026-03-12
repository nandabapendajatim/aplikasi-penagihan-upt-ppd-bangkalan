<template>

  <div class="space-y-8">

    <!-- HEADER -->

    <div class="flex items-center justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Dashboard
        </h1>

        <p class="text-sm text-gray-500">
          Monitoring Pengembalian SK Dinas Luar
        </p>
      </div>

      <select v-model="selectedMonth" class="select select-bordered" @change="loadData">
        <option v-for="m in months" :key="m" :value="m">
          {{ m }}
        </option>
      </select>

    </div>

    <!-- SK TERIMA -->

    <div>

      <h2 class="font-semibold mb-3">
        SK Terima
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div class="card bg-gradient-to-r from-green-500 to-green-600 text-white shadow hover:scale-105 transition">
          <div class="card-body flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">SPSO</p>
              <p class="text-3xl font-bold">{{ terima.spso }}</p>
            </div>
            <Icon icon="heroicons:document-text" class="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-green-500 to-green-600 text-white shadow hover:scale-105 transition">
          <div class="card-body flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">NPP</p>
              <p class="text-3xl font-bold">{{ terima.npp }}</p>
            </div>
            <Icon icon="heroicons:document" class="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-green-500 to-green-600 text-white shadow hover:scale-105 transition">
          <div class="card-body flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">NTP</p>
              <p class="text-3xl font-bold">{{ terima.ntp }}</p>
            </div>
            <Icon icon="heroicons:clipboard-document-list" class="w-10 h-10 opacity-80" />
          </div>
        </div>

      </div>

    </div>



    <!-- SK KEMBALI -->

    <div>

      <h2 class="font-semibold mb-3">
        SK Kembali
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow hover:scale-105 transition">
          <div class="card-body flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">SPSO</p>
              <p class="text-3xl font-bold">{{ kembali.spso }}</p>
            </div>
            <Icon icon="heroicons:check-circle" class="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow hover:scale-105 transition">
          <div class="card-body flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">NPP</p>
              <p class="text-3xl font-bold">{{ kembali.npp }}</p>
            </div>
            <Icon icon="heroicons:check-badge" class="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow hover:scale-105 transition">
          <div class="card-body flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">NTP</p>
              <p class="text-3xl font-bold">{{ kembali.ntp }}</p>
            </div>
            <Icon icon="heroicons:check" class="w-10 h-10 opacity-80" />
          </div>
        </div>

      </div>

    </div>



    <!-- SISA SK -->

    <div>

      <h2 class="font-semibold mb-3">
        Sisa SK
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div class="card bg-gradient-to-r from-orange-500 to-red-500 text-white shadow">
          <div class="card-body flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">SPSO</p>
              <p class="text-3xl font-bold">
                {{ terima.spso - kembali.spso }}
              </p>
            </div>
            <Icon icon="heroicons:exclamation-triangle" class="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-orange-500 to-red-500 text-white shadow">
          <div class="card-body flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">NPP</p>
              <p class="text-3xl font-bold">
                {{ terima.npp - kembali.npp }}
              </p>
            </div>
            <Icon icon="heroicons:exclamation-triangle" class="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div class="card bg-gradient-to-r from-orange-500 to-red-500 text-white shadow">
          <div class="card-body flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">NTP</p>
              <p class="text-3xl font-bold">
                {{ terima.ntp - kembali.ntp }}
              </p>
            </div>
            <Icon icon="heroicons:exclamation-triangle" class="w-10 h-10 opacity-80" />
          </div>
        </div>

      </div>

    </div>

    <!-- PROGRESS TARGET -->

    <div class="card bg-base-100 shadow">

      <div class="card-body">

        <h2 class="card-title">
          Progress Bulan Ini
        </h2>

        <progress class="progress progress-primary w-full" :value="totalKembali" :max="totalTerima"></progress>

        <p class="text-sm text-gray-500 mt-2">
          {{ totalKembali }} SK telah di kembalikan dari total {{ totalTerima }} SK Terima
        </p>

      </div>

    </div>

    <!-- CHART -->

    <DailyChart :labels="chartLabels" :terima="chartTerima" :kembali="chartKembali" />

  </div>

</template>



<script setup>

import { Icon } from '@iconify/vue'

definePageMeta({
  middleware: 'auth'
})

const months = [
  "januari", "februari", "maret", "april", "mei", "juni",
  "juli", "agustus", "september", "oktober", "november", "desember"
]

const currentMonthIndex = new Date().getMonth()
const selectedMonth = ref(months[currentMonthIndex])

const terima = ref({ spso: 0, npp: 0, ntp: 0 })
const kembali = ref({ spso: 0, npp: 0, ntp: 0 })

const chartLabels = ref([])
const chartTerima = ref([])
const chartKembali = ref([])

const totalTerima = computed(() => {
  return terima.value.spso + terima.value.npp + terima.value.ntp
})

const totalKembali = computed(() => {
  return kembali.value.spso + kembali.value.npp + kembali.value.ntp
})

const loadData = async () => {

  const data = await $fetch('/api/hasil_dinas', {
    query: { bulan: selectedMonth.value }
  })

  terima.value = { spso: 0, npp: 0, ntp: 0 }
  kembali.value = { spso: 0, npp: 0, ntp: 0 }

  const harian = {}

  data.forEach(row => {

    terima.value.spso += Number(row.terima?.spso || 0)
    terima.value.npp += Number(row.terima?.npp || 0)
    terima.value.ntp += Number(row.terima?.ntp || 0)

    kembali.value.spso += Number(row.kembali?.spso || 0)
    kembali.value.npp += Number(row.kembali?.npp || 0)
    kembali.value.ntp += Number(row.kembali?.ntp || 0)

    const tgl = row.tanggal

    if (!harian[tgl]) {
      harian[tgl] = { terima: 0, kembali: 0 }
    }

    harian[tgl].terima += Number(row.terima?.jumlah || 0)
    harian[tgl].kembali += Number(row.kembali?.jumlah || 0)

  })

  chartLabels.value = Object.keys(harian)
  chartTerima.value = Object.values(harian).map(x => x.terima)
  chartKembali.value = Object.values(harian).map(x => x.kembali)

}

onMounted(loadData)

</script>