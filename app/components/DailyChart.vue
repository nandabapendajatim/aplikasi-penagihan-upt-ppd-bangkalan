<template>
    <div class="card bg-base-100 shadow">
        <div class="card-body">
            <h2 class="card-title">
                Grafik Harian SK
            </h2>

            <Line :data="chartData" :options="options" />
        </div>
    </div>
</template>

<script setup>
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
} from 'chart.js'

import { Line } from 'vue-chartjs'

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
)

const props = defineProps({
    labels: Array,
    terima: Array,
    kembali: Array
})

const chartData = computed(() => ({
    labels: props.labels,
    datasets: [
        {
            label: 'SK Terima',
            data: props.terima,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.2)',
            tension: 0.3,
            fill: true
        },
        {
            label: 'SK Kembali',
            data: props.kembali,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.2)',
            tension: 0.3,
            fill: true
        }
    ]
}))

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top'
        }
    }
}
</script>