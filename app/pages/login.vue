<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-4">
    <div class="card w-full max-w-md bg-base-100 shadow-2xl">
      <div class="card-body">

        <div class="text-center mb-6">
          <h1 class="text-lg font-semibold text-gray-500">
            Aplikasi Pengembalian Hasil Dinas Luar
          </h1>
          <p class="text-sm text-gray-400 mt-1">
            UPT PPD Bangkalan
          </p>
          <h2 class="text-2xl font-bold mt-2">
            Login
          </h2>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">

          <div class="form-control">
            <label class="label">
              <span class="label-text">NIP</span>
            </label>
            <input
              v-model="nip"
              type="text"
              placeholder="Masukkan NIP"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="Masukkan Password"
              class="input input-bordered w-full"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            Login
          </button>

        </form>

        <div v-if="error" class="alert alert-error mt-4">
          <span>{{ error }}</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
const nip = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: {
        nip: nip.value,
        password: password.value
      }
    })

    return navigateTo('/form-dinas') // ← tambahkan return
  } catch (err) {
    error.value = 'Login gagal'
  }
}
</script>