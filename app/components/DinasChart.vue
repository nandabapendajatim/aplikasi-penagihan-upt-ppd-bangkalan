    <template>

  <div class="card bg-base-100 shadow">

    <div class="card-body">

      <h2 class="card-title">
        Statistik Pengembalian SK
      </h2>

      <Bar
        :data="chartData"
        :options="chartOptions"
      />

    </div>

  </div>

</template>

<script setup>

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

import { Bar } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)

const props = defineProps({
  spso: Number,
  npp: Number,
  ntp: Number
})

const chartData = computed(() => ({
  labels: ['SPSO', 'NPP', 'NTP'],
  datasets: [
    {
      label: 'Jumlah SK',
      data: [
        props.spso,
        props.npp,
        props.ntp
      ]
    }
  ]
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    }
  }
}

</script>