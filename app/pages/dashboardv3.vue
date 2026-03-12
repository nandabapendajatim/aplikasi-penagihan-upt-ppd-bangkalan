<template>

<div class="p-6 space-y-6">

  <!-- HEADER -->

  <div class="flex justify-between items-center">

    <div>
      <h1 class="text-2xl font-bold text-gray-800">
        Dashboard SK
      </h1>
      <p class="text-sm text-gray-500">
        Monitoring penerimaan dan pengembalian SK
      </p>
    </div>

    <select
      v-model="bulan"
      @change="loadData"
      class="border rounded-lg px-3 py-2 text-sm"
    >
      <option
        v-for="b in daftarBulan"
        :key="b"
        :value="b"
      >
        {{ b }}
      </option>
    </select>

  </div>

  <!-- CARD STAT -->

  <div class="grid md:grid-cols-3 gap-6">

    <!-- SPSO -->

    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-5 shadow">

      <h3 class="text-sm uppercase opacity-80">
        SPSO
      </h3>

      <div class="grid grid-cols-3 mt-3 text-sm">

        <div>
          <p class="opacity-80">Terima</p>
          <p class="text-xl font-bold">
            {{ data?.terima.spso || 0 }}
          </p>
        </div>

        <div>
          <p class="opacity-80">Kembali</p>
          <p class="text-xl font-bold">
            {{ data?.kembali.spso || 0 }}
          </p>
        </div>

        <div>
          <p class="opacity-80">Sisa</p>
          <p class="text-xl font-bold">
            {{ data?.sisa.spso || 0 }}
          </p>
        </div>

      </div>

    </div>

    <!-- NPP -->

    <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-5 shadow">

      <h3 class="text-sm uppercase opacity-80">
        NPP
      </h3>

      <div class="grid grid-cols-3 mt-3 text-sm">

        <div>
          <p class="opacity-80">Terima</p>
          <p class="text-xl font-bold">
            {{ data?.terima.npp || 0 }}
          </p>
        </div>

        <div>
          <p class="opacity-80">Kembali</p>
          <p class="text-xl font-bold">
            {{ data?.kembali.npp || 0 }}
          </p>
        </div>

        <div>
          <p class="opacity-80">Sisa</p>
          <p class="text-xl font-bold">
            {{ data?.sisa.npp || 0 }}
          </p>
        </div>

      </div>

    </div>

    <!-- NTP -->

    <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-5 shadow">

      <h3 class="text-sm uppercase opacity-80">
        NTP
      </h3>

      <div class="grid grid-cols-3 mt-3 text-sm">

        <div>
          <p class="opacity-80">Terima</p>
          <p class="text-xl font-bold">
            {{ data?.terima.ntp || 0 }}
          </p>
        </div>

        <div>
          <p class="opacity-80">Kembali</p>
          <p class="text-xl font-bold">
            {{ data?.kembali.ntp || 0 }}
          </p>
        </div>

        <div>
          <p class="opacity-80">Sisa</p>
          <p class="text-xl font-bold">
            {{ data?.sisa.ntp || 0 }}
          </p>
        </div>

      </div>

    </div>

  </div>


  <!-- PROGRESS BULAN -->

  <div class="bg-white rounded-xl shadow p-6">

    <h2 class="font-semibold mb-4">
      Progress Pengembalian Bulan Ini
    </h2>

    <div class="space-y-4">

      <ProgressBar
        label="SPSO"
        :terima="data?.terima.spso || 0"
        :kembali="data?.kembali.spso || 0"
      />

      <ProgressBar
        label="NPP"
        :terima="data?.terima.npp || 0"
        :kembali="data?.kembali.npp || 0"
      />

      <ProgressBar
        label="NTP"
        :terima="data?.terima.ntp || 0"
        :kembali="data?.kembali.ntp || 0"
      />

    </div>

  </div>


  <!-- CHART -->

  <div class="bg-white rounded-xl shadow p-6">

    <h2 class="font-semibold mb-4">
      Grafik Harian
    </h2>

    <Line
      :data="chartData"
      :options="chartOptions"
    />

  </div>

</div>

</template>


<script setup>

import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)


const daftarBulan = [
  'januari','februari','maret','april','mei','juni',
  'juli','agustus','september','oktober','november','desember'
]


const now = new Date()

const bulan = ref(
  daftarBulan[now.getMonth()]
)


const data = ref(null)


async function loadData(){

  const res = await $fetch('/api/dashboard-summary',{
    query:{bulan:bulan.value}
  })

  data.value = res

}


onMounted(loadData)



const chartData = computed(()=>({

  labels: data.value?.chart.labels || [],

  datasets:[

    {
      label:'SK Terima',
      data:data.value?.chart.terima || [],
      borderColor:'#3b82f6',
      backgroundColor:'#3b82f6'
    },

    {
      label:'SK Kembali',
      data:data.value?.chart.kembali || [],
      borderColor:'#22c55e',
      backgroundColor:'#22c55e'
    }

  ]

}))


const chartOptions = {

  responsive:true,

  plugins:{
    legend:{position:'top'}
  }

}

</script>