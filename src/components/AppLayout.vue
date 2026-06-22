<!--
  components/AppLayout.vue — Layout Utama Dashboard
  ─────────────────────────────────────────────────────
  Wrapper layout untuk semua halaman yang memerlukan:
  - Sidebar (desktop + mobile)
  - Topbar
  - Slot konten halaman

  Props:
  - breadcrumb: string — teks di atas judul (default: 'Beranda Utama')
  - title: string      — judul halaman (wajib)

  Slots:
  - default    — konten halaman
  - badge      — badge di samping judul (misalnya "5 Menunggu")
  - search     — override search bar topbar (kosongi untuk hilangkan)

  Contoh pemakaian:
    <AppLayout breadcrumb="Beranda Utama" title="Dashboard HRM">
      <template #badge>
        <span class="...">5 Menunggu</span>
      </template>
      <div>... konten ...</div>
    </AppLayout>
-->
<script setup>
import AppSidebar from './AppSidebar.vue'
import AppTopbar  from './AppTopbar.vue'

defineProps({
  breadcrumb: { type: String, default: 'Beranda Utama' },
  title:      { type: String, required: true },
})
</script>

<template>
  <section class="h-screen overflow-hidden bg-[#F5F0E8] text-slate-800 font-sans flex">

    <!-- ── Dekorasi Background ── -->
    <div class="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div class="absolute inset-0 bg-grid opacity-[0.04]" />
      <div class="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[120px]" />
      <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px]" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/60 rounded-full blur-[80px]" />
    </div>

    <!-- ── Sidebar ── -->
    <AppSidebar />

    <!-- ── Area Utama ── -->
    <div class="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">

      <!-- Topbar -->
      <AppTopbar :breadcrumb="breadcrumb" :title="title" class="shrink-0">
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps ?? {}" />
        </template>
      </AppTopbar>

      <!-- Konten Halaman — HANYA ini yang scroll -->
      <main class="flex-1 overflow-y-auto pt-4 px-3 pb-6 sm:px-5 lg:px-7">
        <slot />
      </main>

    </div>
  </section>
</template>