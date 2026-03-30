<template>

  <div class="p-2">

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- ===================== -->
      <!-- TABEL DATA -->
      <!-- ===================== -->
      <div class="lg:col-span-9">

        <div class="card bg-base-100 shadow-xl">

          <div class="card-body">

            <div class="flex justify-between items-center mb-4">

              <h2 class="card-title">
                Data {{ selectedMonth }}
              </h2>

              <select v-model="selectedMonth" @change="fetchData" class="select select-bordered">

                <option v-for="bulan in months" :key="bulan" :value="bulan">
                  {{ bulan }}
                </option>

              </select>

            </div>

            <div class="overflow-x-auto max-h-[600px] overflow-y-auto">

              <table class="table table-zebra text-center">

                <thead class="sticky top-0 z-10 text-white">

                  <tr>

                    <th rowspan="2" class="bg-base-300 text-base-content">
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

                  <tr v-for="(row, index) in rows" :key="index">

                    <td>{{ row.tanggal }}</td>

                    <!-- SK TERIMA -->
                    <td>{{ row.terima.spso }}</td>
                    <td>{{ row.terima.npp }}</td>
                    <td>{{ row.terima.ntp }}</td>
                    <td>{{ row.terima.jumlah }}</td>

                    <!-- SK KEMBALI -->
                    <td>{{ row.kembali.spso }}</td>
                    <td>{{ row.kembali.npp }}</td>
                    <td>{{ row.kembali.ntp }}</td>
                    <td>{{ row.kembali.jumlah }}</td>

                    <!-- SISA -->
                    <td :class="row.sisa.spso < 0 ? 'text-error font-bold' : ''">
                      {{ row.sisa.spso }}
                    </td>

                    <td :class="row.sisa.npp < 0 ? 'text-error font-bold' : ''">
                      {{ row.sisa.npp }}
                    </td>

                    <td :class="row.sisa.ntp < 0 ? 'text-error font-bold' : ''">
                      {{ row.sisa.ntp }}
                    </td>

                    <td :class="row.sisa.jumlah < 0 ? 'text-error font-bold' : ''">
                      {{ row.sisa.jumlah }}
                    </td>

                  </tr>

                </tbody>

                <tfoot class="sticky bottom-0 z-10 font-bold bg-base-200">

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
      <div class="lg:col-span-3">

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

                <input type="date" v-model="form.tanggal" class="input input-bordered w-full" required />

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
  }, 3000)
}

const selectedMonth = ref("Januari")

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

const submitForm = async () => {

  if (!form.value.tanggal || !form.value.jenisSurat) {
    showNotification('error', 'Tanggal dan Jenis Surat harus diisi!')
    return
  }

  isSubmitting.value = true

  try {

    await $fetch('/api/inputDinas', {
      method: 'POST',
      body: form.value
    })

    // reset form
    form.value.jenisSurat = ''
    form.value.jumlah = 1

    // reload tabel
    await fetchData()

    // notif sukses
    showNotification('success', 'Data berhasil disimpan')

  } catch (err) {

    console.error(err)

    showNotification('error', 'Gagal mengirim data')

  } finally {

    isSubmitting.value = false

  }

}

</script>