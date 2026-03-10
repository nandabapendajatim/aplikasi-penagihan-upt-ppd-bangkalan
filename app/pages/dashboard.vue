<template>
  <div>
    <h1>Dashboard</h1>
    <NuxtLink to="/input">Input Data</NuxtLink>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>