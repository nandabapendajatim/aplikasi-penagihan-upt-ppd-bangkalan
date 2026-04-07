<template>
  <div class="p-6 max-w-2xl mx-auto">

    <!-- Card -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body p-8">

        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="card-title text-3xl font-bold mb-2">
            📊 Laporan Individu
          </h1>
          <p class="text-base-content/70 text-lg">
            Cetak laporan berdasarkan periode tanggal
          </p>
        </div>

        <!-- Filter Form -->
        <form @submit.prevent="cetak" class="space-y-6">

          <!-- Date Range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Tanggal Awal</span>
              </label>
              <input type="date" v-model="startDate" class="input input-bordered input-lg w-full" required />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Tanggal Akhir</span>
              </label>
              <input type="date" v-model="endDate" class="input input-bordered input-lg w-full" required />
            </div>

          </div>

          <!-- Periode Info -->
          <div class="alert alert-info shadow-lg mb-6">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
              </svg>
              <span>Periode: <strong>{{ formatPeriode }}</strong></span>
            </div>
          </div>

          <!-- Button -->
          <div class="card-actions justify-center">
            <button type="submit" class="btn btn-primary btn-lg px-12">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Cetak PDF
            </button>
          </div>

        </form>

      </div>
    </div>

  </div>
</template>

<script setup>
const startDate = ref('')
const endDate = ref('')

// Format date helper
function formatLocalDate(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Default: BULAN LALU FULL (1 Maret - 31 Maret)
const setPreviousMonthRange = () => {
  const now = new Date()
  const previousMonth = (now.getMonth() + 11) % 12 // Bulan lalu
  const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  // Tanggal 1 bulan lalu
  const start = new Date(previousYear, previousMonth, 1)
  // Tanggal akhir bulan lalu
  const end = new Date(previousYear, previousMonth + 1, 0)

  startDate.value = formatLocalDate(start)
  endDate.value = formatLocalDate(end)
}

// Tambah function ini di script setup
const formatIndoDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

// Update computed
const formatPeriode = computed(() => {
  if (!startDate.value || !endDate.value) return ''
  return `${formatIndoDate(startDate.value)} s/d ${formatIndoDate(endDate.value)}`
})

// On mount
onMounted(() => {
  setPreviousMonthRange()
})

// Cetak PDF
const cetak = async () => {
  if (!startDate.value || !endDate.value) {
    alert('Pilih tanggal awal dan akhir!')
    return
  }

  try {
    const res = await $fetch('/api/laporan/individu', {
      method: 'POST',
      body: {
        startDate: startDate.value,
        endDate: endDate.value
      }
    })

    const blob = new Blob([res], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')

  } catch (error) {
    console.error('Gagal cetak:', error)
    alert('Gagal generate PDF!')
  }
}
</script>