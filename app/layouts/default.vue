<template>

  <div class="flex flex-col h-screen">

    <!-- Navbar di atas -->
    <Navbar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <!-- Area bawah navbar -->
    <div class="flex flex-1">

      <!-- Sidebar -->
      <Sidebar :open="sidebarOpen" />

      <!-- Content -->
      <main class="flex-1 p-4 overflow-y-auto bg-base-200">
        <NuxtPage />
      </main>

    </div>

    <!-- Footer -->
    <Footer />

  </div>

</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import Sidebar from '~/components/Sidebar.vue'
import Footer from '~/components/Footer.vue'

const sidebarOpen = ref(true)
</script>