<template>
  <div class="min-h-screen bg-base-200">

    <!-- Navbar -->
    <div class="navbar bg-base-100 shadow-md px-6">
      <div class="flex-1">
        <span class="text-lg font-semibold">
          Aplikasi Pengembalian Dinas Luar
        </span>
      </div>
      <div class="flex-none">
        <button class="btn btn-error btn-sm" onclick="logout_modal.showModal()">
          Logout
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex justify-center items-start py-10 px-4">
      <div class="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div class="card-body">

          <h2 class="card-title text-xl mb-4">
            Input Data
          </h2>

          <form @submit.prevent="submitForm" class="space-y-4">

            <!-- Nama -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Nama</span>
              </label>
              <input type="text" v-model="form.nama" class="input input-bordered w-full bg-base-200" readonly />
            </div>

            <!-- Tanggal -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Tanggal</span>
              </label>
              <input type="date" v-model="form.tanggal" class="input input-bordered w-full" required />
            </div>

            <!-- Jenis Surat -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Jenis Surat</span>
              </label>
              <select v-model="form.jenisSurat" class="select select-bordered w-full" required>
                <option value="" disabled>Pilih jenis surat</option>
                <option v-for="item in jenisSuratOptions" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
            </div>

            <!-- Jumlah -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Jumlah</span>
              </label>
              <input type="number" v-model="form.jumlah" min="1" class="input input-bordered w-full" required />
            </div>

            <!-- Submit -->
            <button type="submit" class="btn btn-primary w-full mt-4" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
              {{ isSubmitting ? 'Mengirim...' : 'Submit Data' }}
            </button>

          </form>

        </div>
      </div>
    </div>

  </div>

  <!-- Modal Konfirmasi Logout -->
  <dialog id="logout_modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Konfirmasi Logout</h3>
      <p class="py-4">
        Apakah Anda yakin ingin keluar dari aplikasi?
      </p>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Batal</button>
        </form>
        <button class="btn btn-error" @click="confirmLogout">
          Ya, Logout
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser } from '~/composables/useUser'
import { useRouter } from 'vue-router'

const router = useRouter()

// Ambil data login dari cookie
const { userNama, userNip } = useUser()

const form = ref({
  nama: '',
  tanggal: '',
  jenisSurat: '',
  jumlah: 1
})

// Jenis surat statis
const jenisSuratOptions = ref(['SPSO', 'NPP', 'NTP'])

// State loading saat submit
const isSubmitting = ref(false)

onMounted(() => {
  form.value.nama = userNama?.value || ''
})

const submitForm = async () => {
  if (!form.value.tanggal || !form.value.jenisSurat) {
    alert('Tanggal dan Jenis Surat harus diisi!')
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/inputDinas', {
      method: 'POST',
      body: form.value
    })
    alert('Data berhasil dikirim!')

    // Reset form kecuali nama
    form.value.tanggal = ''
    form.value.jenisSurat = ''
    form.value.jumlah = 1
  } catch (err) {
    console.error(err)
    alert('Gagal mengirim data.')
  } finally {
    isSubmitting.value = false
  }
}

// Logout: hapus cookie & redirect ke login
const logout = () => {
  const nip = useCookie('nip')
  const nama = useCookie('nama')
  const role = useCookie('role')

  nip.value = null
  nama.value = null
  role.value = null

  router.push('/login')
}

const openLogoutModal = () => {
  const modal = document.getElementById('logout_modal') as HTMLDialogElement
  modal?.showModal()
}

const confirmLogout = () => {
  const modal = document.getElementById('logout_modal') as HTMLDialogElement
  modal?.close()
  logout()
}
</script>