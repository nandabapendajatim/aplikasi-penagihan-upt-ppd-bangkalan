<template>
    <aside :class="[
        'bg-base-100 border-r transition-all duration-300',
        props.open ? 'w-56' : 'w-16'
    ]">

        <ul class="menu p-4 text-base-content">

            <li class="menu-title" v-if="props.open">
                <span>Menu</span>
            </li>

            <li>
                <NuxtLink to="/dashboard" :class="[
                    'flex items-center gap-3 rounded-lg px-3 py-2',
                    route.path === '/dashboard'
                        ? 'bg-primary text-primary-content'
                        : 'hover:bg-base-200'
                ]">
                    <Icon icon="heroicons:home" class="w-5 h-5" />
                    <span v-if="props.open">Dashboard</span>
                </NuxtLink>
            </li>

            <li>
                <NuxtLink to="/form-dinas" :class="[
                    'flex items-center gap-3 rounded-lg px-3 py-2',
                    route.path === '/form-dinas'
                        ? 'bg-primary text-primary-content'
                        : 'hover:bg-base-200'
                ]">
                    <Icon icon="heroicons:document-text" class="w-5 h-5" />
                    <span v-if="props.open">Form Dinas</span>
                </NuxtLink>
            </li>

            <li>
                <NuxtLink to="/laporan" :class="[
                    'flex items-center gap-3 rounded-lg px-3 py-2',
                    route.path === '/laporan'
                        ? 'bg-primary text-primary-content'
                        : 'hover:bg-base-200'
                ]">
                    <Icon icon="heroicons:chart-bar" class="w-5 h-5" />
                    <span v-if="props.open">Laporan</span>
                </NuxtLink>
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
</script>