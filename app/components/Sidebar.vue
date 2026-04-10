<template>
  <aside :class="[
    'bg-base-100 border-r transition-all duration-300',
    props.open ? 'w-56' : 'w-16'
  ]">

    <ul class="menu p-4 text-base-content">

      <li class="menu-title" v-if="props.open">
        <span>Menu</span>
      </li>

      <!-- DASHBOARD -->
      <li>
        <NuxtLink to="/dashboard" :class="menuClass('/dashboard')">
          <Icon icon="heroicons:home" class="w-5 h-5" />
          <span v-if="props.open">Dashboard</span>
        </NuxtLink>
      </li>

      <!-- FORM DINAS -->
      <li>
        <NuxtLink to="/form-dinas" :class="menuClass('/form-dinas')">
          <Icon icon="heroicons:document-text" class="w-5 h-5" />
          <span v-if="props.open">Form Dinas</span>
        </NuxtLink>
      </li>

      <!-- 🔥 LAPORAN (PARENT MENU) -->
      <li>
        <details :open="route.path.startsWith('/laporan')">

          <summary class="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-base-200">
            <Icon icon="heroicons:chart-bar" class="w-5 h-5" />
            <span v-if="props.open">Laporan</span>
          </summary>

          <ul>

            <!-- 🔥 ADMIN ONLY -->
            <li v-if="role === 'admin'">
              <NuxtLink to="/laporan/rekap" :class="menuClass('/laporan/rekap')">
                <span v-if="props.open">Laporan Rekap</span>
              </NuxtLink>
            </li>

            <!-- SEMUA USER -->
            <li>
              <NuxtLink to="/laporan/individu" :class="menuClass('/laporan/individu')">
                <span v-if="props.open">Laporan Individu</span>
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
</script>