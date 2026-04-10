<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center">

    <h1 class="text-4xl font-bold mb-2">
      {{ error.statusCode }}
    </h1>

    <p class="mb-6 text-gray-500">
      {{ error.statusMessage || 'Halaman tidak ditemukan' }}
    </p>

    <button class="btn btn-primary" @click="goDashboard">
      Ke Dashboard
    </button>

  </div>
</template>

<script setup>
const error = useError()
const auth = useCookie('auth')

const goDashboard = () => {
  clearError({
    redirect: auth.value ? '/dashboard' : '/login'
  })
}
</script>