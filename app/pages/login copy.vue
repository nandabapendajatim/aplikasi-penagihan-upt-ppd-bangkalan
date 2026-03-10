<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form @submit.prevent="submitLogin" class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
      <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

      <div class="mb-4">
        <label class="block mb-1 font-medium">NIP</label>
        <input type="text" v-model="nip" required
          class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Password</label>
        <input type="password" v-model="password" required
          class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <button type="submit"
        class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
        {{ isLoggingIn ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const nip = ref('')
const password = ref('')
const isLoggingIn = ref(false)

const submitLogin = async () => {
  isLoggingIn.value = true
  try {
    const res = await $fetch('/api/login', {
      method: 'POST',
      body: { nip: nip.value, password: password.value }
    })
    if (res.success) router.push('/form-dinas')
  } catch (err: any) {
    console.error(err)
    alert(err.statusMessage || 'Login gagal')
  } finally {
    isLoggingIn.value = false
  }
}
</script>