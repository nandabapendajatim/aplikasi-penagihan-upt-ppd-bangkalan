<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-base-200">

    <!-- LEFT SIDE - LOGIN -->
    <div class="flex items-center justify-center p-6">

      <div class="card w-full max-w-lg bg-base-100 shadow-2xl">

        <div class="card-body p-8">

          <!-- LOGO -->
          <div class="flex flex-col items-center mb-8">
            <img src="/logo-kantor.png" class="w-24 mb-4" alt="Logo Kantor" />

            <h1 class="text-xl font-bold text-gray-700 text-center leading-snug">
              APLIKASI PENGEMBALIAN HASIL DINAS LUAR
              <br>
              UPT PPD BANGKALAN
            </h1>
          </div>

          <!-- TITLE -->
          <!-- <h2 class="text-2xl font-bold text-center mb-6">
            LOGIN
          </h2> -->

          <!-- FORM -->
          <form @submit.prevent="handleLogin" class="space-y-6">

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base font-medium">NIP</span>
              </label>

              <input v-model="nip" type="text" placeholder="Masukkan NIP" class="input input-bordered input-lg w-full"
                required />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base font-medium">Password</span>
              </label>

              <input v-model="password" type="password" placeholder="Masukkan Password"
                class="input input-bordered input-lg w-full" required />
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full mt-2">
              LOGIN
            </button>

          </form>

          <!-- ERROR -->
          <div v-if="error" class="alert alert-error mt-6">
            <span>{{ error }}</span>
          </div>

        </div>

      </div>

    </div>

    <!-- RIGHT SIDE - FOTO KANTOR -->
    <div class="hidden lg:block relative">

      <img src="/foto-kantor.jpeg" alt="Foto Kantor" class="w-full h-full object-cover" />

    </div>

  </div>
</template>

<script setup>

definePageMeta({
  layout: "auth"
})

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

    return navigateTo('/dashboard')

  } catch (err) {

    error.value = 'Login gagal'

  }

}

</script>