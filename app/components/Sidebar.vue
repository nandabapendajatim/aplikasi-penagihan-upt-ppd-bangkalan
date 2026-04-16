<template>
  <aside :class="[
    'bg-base-100 border-r transition-all duration-300 overflow-visible',
    isMobile ? 'w-16' : (props.open ? 'w-52' : 'w-16')
  ]">

    <ul class="menu p-2 lg:p-4 text-base-content">

      <li class="menu-title" v-if="props.open">
        <span>Menu</span>
      </li>

      <!-- DASHBOARD -->
      <li class="relative overflow-visible">
        <NuxtLink to="/dashboard" :class="menuClass('/dashboard')">
          <Icon icon="heroicons:home" class="w-5 h-5" />
          <span v-if="props.open && !isMobile">Dashboard</span>
        </NuxtLink>
      </li>

      <!-- FORM DINAS -->
      <li class="relative overflow-visible">
        <NuxtLink to="/form-dinas" :class="menuClass('/form-dinas')">
          <Icon icon="heroicons:document-text" class="w-5 h-5" />
          <span v-if="props.open && !isMobile">Form Dinas</span>
        </NuxtLink>
      </li>

      <!-- 🔥 LAPORAN (PARENT MENU) -->
      <li class="relative overflow-visible">
        <details :open="isLaporanOpen" class="relative">

          <summary @click.prevent="isLaporanOpen = !isLaporanOpen"
            class="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-base-200">
            <Icon icon="heroicons:chart-bar" class="w-5 h-5" />
            <span v-if="props.open && !isMobile">Laporan</span>
          </summary>

          <ul :class="[
            isMobile
              ? 'mt-2 bg-base-200 rounded-lg p-1'
              : ''
          ]">

            <!-- 🔥 ADMIN ONLY -->
            <li v-if="role === 'admin'">
              <NuxtLink to="/laporan/rekap" :class="menuClass('/laporan/rekap')">
                <span>Laporan Rekap</span>
              </NuxtLink>
            </li>


            <!-- SEMUA USER -->
            <li>
              <NuxtLink to="/laporan/individu" :class="menuClass('/laporan/individu')">
                <span>Laporan Individu</span>
              </NuxtLink>
            </li>

          </ul>

        </details>
      </li>

    </ul>

  </aside>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'

const isMobile = ref(false)

onMounted(() => {
  const checkScreen = () => {
    isMobile.value = window.innerWidth < 1024 // < lg
  }

  checkScreen()
  window.addEventListener('resize', checkScreen)
})

const route = useRoute()
const props = defineProps({
  open: Boolean
})

// 🔥 ambil role dari cookie
const roleCookie = useCookie('role')
const role = computed(() => roleCookie.value || '')

// helper biar gak ngulang class
const menuClass = (path) => [
  'flex items-center gap-3 rounded-lg px-3 py-2',
  route.path === path
    ? 'bg-primary text-primary-content'
    : 'hover:bg-base-200'
]

const isLaporanOpen = ref(false)
watch(() => route.path, (val) => {
  isLaporanOpen.value = val.startsWith('/laporan')
}, { immediate: true })
</script>