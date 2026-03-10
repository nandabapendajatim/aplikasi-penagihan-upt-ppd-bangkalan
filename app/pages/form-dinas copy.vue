<template>
  <div class="min-h-screen bg-gray-100 p-6">

    <!-- Toast Notification -->
    <div v-if="notification.show"
         class="toast toast-top toast-end z-50">
      <div class="alert"
           :class="{
             'alert-success': notification.type === 'success',
             'alert-error': notification.type === 'error',
             'alert-info': notification.type === 'info'
           }">
        <span>{{ notification.message }}</span>
      </div>
    </div>

    <div class="flex justify-end mb-4">
      <button @click="logout"
        class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
        Logout
      </button>
    </div>

    <form @submit.prevent="submitForm"
      class="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-center">Form Dinas</h1>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Nama</label>
        <input type="text" v-model="form.nama" readonly
          class="w-full p-3 border rounded-md bg-gray-100" />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Tanggal</label>
        <input type="date" v-model="form.tanggal" required
          class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Jenis Surat</label>
        <select v-model="form.jenisSurat" required
          class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="" disabled>Pilih jenis surat</option>
          <option v-for="item in jenisSuratOptions" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Jumlah</label>
        <input type="number" v-model="form.jumlah" min="1" required
          class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <button type="submit"
        :disabled="isSubmitting"
        class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50">
        {{ isSubmitting ? 'Mengirim...' : 'Submit' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '~/composables/useUser'

const router = useRouter()
const { userNama } = useUser()

const form = ref({
  nama: '',
  tanggal: '',
  jenisSurat: '',
  jumlah: 1
})

const jenisSuratOptions = ref(['SPSO', 'NPP', 'NTP'])
const isSubmitting = ref(false)

// 🔥 Toast state
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

onMounted(() => {
  if (!userNama?.value) {
    router.push('/login')
  } else {
    form.value.nama = userNama.value
  }
})

const submitForm = async () => {
  if (!form.value.tanggal || !form.value.jenisSurat) {
    showNotification('error', 'Tanggal dan Jenis Surat harus diisi!')
    return
  }

  isSubmitting.value = true

  try {
    const response: any = await $fetch('/api/inputDinas', {
      method: 'POST',
      body: form.value
    })

    if (response.mode === 'updated') {
      showNotification('info', 'Data berhasil diperbarui!')
    } else {
      showNotification('success', 'Data berhasil ditambahkan!')
    }

    // reset form (kecuali nama)
    form.value.tanggal = ''
    form.value.jenisSurat = ''
    form.value.jumlah = 1

  } catch (err) {
    console.error(err)
    showNotification('error', 'Gagal mengirim data.')
  } finally {
    isSubmitting.value = false
  }
}

const logout = () => {
  const nip = useCookie('nip')
  const nama = useCookie('nama')
  const role = useCookie('role')

  nip.value = null
  nama.value = null
  role.value = null

  router.push('/login')
}
</script>