<template>

  <div class="space-y-8">

    <!-- HEADER -->

    <div class="flex items-center justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Dashboard <!-- {{ selectedMonth }} {{ selectedYear }} -->
        </h1>

        <p class="text-sm text-gray-500">
          Monitoring Pengembalian SK
        </p>
      </div>

      <div class="flex items-center gap-2">

        <select v-model="selectedMonth" @change="loadData" class="select select-bordered select-sm w-32">
          <option v-for="m in months" :key="m" :value="m">
            {{ m }}
          </option>
        </select>

        <select v-model="selectedYear" @change="loadData" class="select select-bordered select-sm w-24">
          <option v-for="y in availableYears" :key="y" :value="y">
            {{ y }}
          </option>
        </select>

      </div>

    </div>

    <!-- CARD STATISTIK -->

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

      <!-- SPSO -->
      <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:scale-[1.02] transition">

        <div class="card-body p-5">

          <!-- HEADER -->
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-lg tracking-wide">
              SPSO
            </h2>

            <Icon icon="heroicons:document-text" class="w-7 h-7 opacity-80" />
          </div>

          <!-- DATA -->
          <div class="mt-4 space-y-2">

            <div class="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 font-semibold">
              <span class="text-sm">Terima</span>
              <span class="text-xl font-bold">
                {{ terima.spso }}
              </span>
            </div>

            <div class="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 font-semibold">
              <span class="text-sm">Kembali</span>
              <span class="text-xl font-bold">
                {{ kembali.spso }}
              </span>
            </div>

            <div class="flex justify-between items-center bg-white/20 rounded-lg px-3 py-2 font-semibold">
              <span class="text-sm">Sisa</span>
              <span class="text-xl font-bold">
                {{ terima.spso - kembali.spso }}
              </span>
            </div>

          </div>

        </div>

      </div>



      <!-- NPP -->
      <div class="card bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:scale-[1.02] transition">

        <div class="card-body p-5">

          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-lg tracking-wide">
              NPP
            </h2>

            <Icon icon="heroicons:document" class="w-7 h-7 opacity-80" />
          </div>

          <div class="mt-4 space-y-2">

            <div class="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 font-semibold">
              <span class="text-sm">Terima</span>
              <span class="text-xl font-bold">
                {{ terima.npp }}
              </span>
            </div>

            <div class="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 font-semibold">
              <span class="text-sm">Kembali</span>
              <span class="text-xl font-bold">
                {{ kembali.npp }}
              </span>
            </div>

            <div class="flex justify-between items-center bg-white/20 rounded-lg px-3 py-2 font-semibold">
              <span class="text-sm">Sisa</span>
              <span class="text-xl font-bold">
                {{ terima.npp - kembali.npp }}
              </span>
            </div>

          </div>

        </div>

      </div>



      <!-- NTP -->
      <div class="card bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:scale-[1.02] transition">

        <div class="card-body p-5">

          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-lg tracking-wide">
              NTP
            </h2>

            <Icon icon="heroicons:clipboard-document-list" class="w-7 h-7 opacity-80" />
          </div>

          <div class="mt-4 space-y-2">

            <div class="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 font-semibold">
              <span class="text-sm">Terima</span>
              <span class="text-xl font-bold">
                {{ terima.ntp }}
              </span>
            </div>

            <div class="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 font-semibold">
              <span class="text-sm">Kembali</span>
              <span class="text-xl font-bold">
                {{ kembali.ntp }}
              </span>
            </div>

            <div class="flex justify-between items-center bg-white/20 rounded-lg px-3 py-2 font-semibold">
              <span class="text-sm">Sisa</span>
              <span class="text-xl font-bold">
                {{ terima.ntp - kembali.ntp }}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- PROGRESS -->

    <div class="card bg-base-100 shadow">

      <div class="card-body">

        <h2 class="card-title">
          Progress Bulan Ini
        </h2>

        <progress class="progress progress-primary w-full" :value="totalKembali" :max="totalTerima"></progress>

        <p class="text-sm text-gray-500 mt-2">
          {{ totalKembali }} dari {{ totalTerima }} SK kembali
        </p>

      </div>

    </div>



    <!-- CHART -->

    <DailyChart :labels="chartLabels" :terima="chartTerima" :kembali="chartKembali" />

  </div>

</template>

<script setup>

import { Icon } from '@iconify/vue'

const months = [
  "januari", "februari", "maret", "april", "mei", "juni",
  "juli", "agustus", "september", "oktober", "november", "desember"
]

const now = new Date()
const selectedMonth = ref(months[(now.getMonth() + 11) % 12])
const selectedYear = ref(
  now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
)

const availableYears = [2026, 2027, 2028]

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

  const data = await $fetch('/api/dashboard-summary', {
    query: {
      bulan: selectedMonth.value,
      tahun: selectedYear.value
    }
  })

  terima.value = data.terima
  kembali.value = data.kembali

  chartLabels.value = data.chart.labels
  chartTerima.value = data.chart.terima
  chartKembali.value = data.chart.kembali
}

onMounted(loadData)

</script>