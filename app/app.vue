<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const route = useRoute()

if (process.client && route.path === '/') {
  navigateTo('/login')
}
</script>