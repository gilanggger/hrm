<!--
  components/AppTopbar.vue — Topbar Halaman
  ─────────────────────────────────────────────────────
  Topbar yang muncul di atas semua halaman dashboard.

  Props:
  - breadcrumb: string — teks kecil di atas judul
  - title: string      — judul halaman utama

  Slots (diteruskan dari AppLayout):
  - badge  — badge di samping judul, misal "5 Menunggu"
  - search — override search bar (kirim slot kosong untuk hilangkan)
-->

<script setup>
import { Bell, Search, Menu } from 'lucide-vue-next'
import { useSidebar } from '@/composables/useSidebar.js'

defineProps({
  breadcrumb: { type: String, default: 'Welcome Back 👋' },
  title:      { type: String, required: true },
})

const { mobileSidebarOpen } = useSidebar()
</script>

<template>
  <div class="topbar-sticky shrink-0 px-4 sm:px-6 lg:px-7 py-4">
    <div class="topbar-card rounded-[24px] px-4 sm:px-6 py-4">
      <div class="flex items-center justify-between gap-3">

        <!-- Kiri: hamburger (mobile) + judul -->
        <div class="flex items-center gap-3 min-w-0">
          <!-- Hamburger mobile -->
          <button
            class="lg:hidden w-10 h-10 rounded-xl glass-btn flex items-center justify-center shrink-0"
            @click="mobileSidebarOpen = true"
            aria-label="Buka menu"
          >
            <Menu :size="18" class="text-slate-600" />
          </button>

          <!-- Judul + breadcrumb -->
          <div class="min-w-0">
            <p class="text-slate-500 text-xs tracking-widest uppercase font-medium">{{ breadcrumb }}</p>
            <div class="flex items-center gap-3">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-black truncate bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">
                {{ title }}
              </h2>
              <!-- Slot badge — misal "5 Menunggu" -->
              <slot name="badge" />
            </div>
          </div>
        </div>

        <!-- Kanan: search + notifikasi + avatar -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">

          <!-- Search: bisa di-override dari luar (kirim slot kosong untuk hilangkan) -->
          <slot name="search">
            <div class="relative hidden md:block">
              <Search :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari data pegawai..."
                class="w-[180px] lg:w-[240px] h-10 rounded-xl bg-white/80 border border-slate-200
                       pl-10 pr-4 outline-none text-slate-700 text-sm placeholder:text-slate-400
                       focus:border-sky-400 focus:bg-white transition-all duration-300 shadow-sm"
                aria-label="Pencarian"
              />
            </div>
          </slot>

          <!-- Tombol Notifikasi -->
          <button
            class="relative w-10 h-10 rounded-xl glass-btn flex items-center justify-center group"
            aria-label="Notifikasi"
          >
            <Bell :size="17" class="text-slate-500 group-hover:text-slate-700 transition-colors" />
            <span
              class="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#F5F0E8]"
              aria-hidden="true"
            />
          </button>

          <!-- Avatar User -->
          <div
            class="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl glass-btn cursor-pointer group"
            role="button"
            tabindex="0"
            aria-label="Profil pengguna"
          >
            <img
              src="https://i.pravatar.cc/100"
              class="w-8 h-8 rounded-xl object-cover ring-2 ring-sky-300/40"
              alt="Avatar Admin HRD"
            />
            <div class="hidden lg:block">
              <h3 class="font-bold text-xs text-slate-800">Admin HRD</h3>
              <p class="text-[11px] text-slate-500">HR Manager</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>