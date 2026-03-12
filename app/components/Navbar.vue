<template>
    <div class="navbar bg-base-100 shadow-md px-6">

        <div class="flex-1 flex items-center gap-3">

            <button class="btn btn-ghost" @click="$emit('toggleSidebar')">
                ☰
            </button>

            <img src="/logo-kantor.png" alt="Logo Kantor" class="w-8 h-8 object-contain" />

            <span class="text-lg font-semibold">
                Pengembalian Dinas Luar
            </span>

        </div>

        <div class="flex-none">

            <div class="dropdown dropdown-end">

                <label tabindex="0" class="btn btn-ghost">
                    {{ userNama }}

                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">

                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>

                </label>

                <ul tabindex="0"
                    class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-48">

                    <li>
                        <a>Profil</a>
                    </li>

                    <li>
                        <a @click="openLogoutModal">Logout</a>
                    </li>

                </ul>

            </div>

        </div>

        <!-- MODAL LOGOUT -->
        <dialog id="logout_modal" class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg">Konfirmasi Logout</h3>

                <p class="py-4">
                    Apakah Anda yakin ingin keluar?
                </p>

                <div class="modal-action">

                    <form method="dialog">
                        <button class="btn">Batal</button>
                    </form>

                    <button class="btn btn-error" @click="confirmLogout">
                        Ya, Logout
                    </button>

                </div>
            </div>
        </dialog>

    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUser } from '~/composables/useUser'

const router = useRouter()
const { userNama } = useUser()

const logout = () => {

    const nip = useCookie('nip')
    const nama = useCookie('nama')
    const role = useCookie('role')

    nip.value = null
    nama.value = null
    role.value = null

    router.push('/login')

}

const openLogoutModal = () => {

    const modal = document.getElementById('logout_modal') as HTMLDialogElement
    modal?.showModal()

}

const confirmLogout = () => {

    const modal = document.getElementById('logout_modal') as HTMLDialogElement
    modal?.close()
    logout()

}
</script>