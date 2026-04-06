<template>
  <div class="p-6">

    <div class="bg-base-100 rounded-2xl shadow p-6 space-y-6">

      <!-- TITLE -->
      <div>
        <h1 class="text-2xl font-bold">Laporan Individu</h1>
        <p class="text-sm opacity-70">
          Cetak laporan berdasarkan periode tanggal
        </p>
      </div>

      <!-- FILTER -->
      <div class="flex flex-wrap gap-4 items-end">

        <div class="flex flex-col">
          <label class="text-sm mb-1">Tanggal Awal</label>
          <input
            type="date"
            v-model="startDate"
            class="input input-bordered"
          />
        </div>

        <div class="flex flex-col">
          <label class="text-sm mb-1">Tanggal Akhir</label>
          <input
            type="date"
            v-model="endDate"
            class="input input-bordered"
          />
        </div>

        <button @click="cetak" class="btn btn-primary">
          Cetak PDF
        </button>

      </div>

    </div>

  </div>
</template>

<script setup>
const today = new Date()

function formatLocalDate(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// default awal bulan
const startDate = ref(
  formatLocalDate(new Date(today.getFullYear(), today.getMonth(), 1))
)

// default akhir bulan
const endDate = ref(
  formatLocalDate(new Date(today.getFullYear(), today.getMonth() + 1, 0))
)

const cetak = async () => {
  const res = await $fetch('/api/laporan/individu', {
    method: 'POST',
    body: {
      startDate: startDate.value,
      endDate: endDate.value
    }
  })

  const blob = new Blob([res], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  window.open(url)
}
</script>