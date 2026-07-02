<script setup>
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Network,
  Building2,
  Users,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import OrgNode from '@/components/OrgNode.vue'
import { useStrukturOrganisasi } from '@/composables/useStrukturOrganisasi'

const { loading, error, struktur, warnaDivisi, refetch } =
  useStrukturOrganisasi()

const legenda = [
  { label: 'Direksi', warna: '#8B5CF6' },
  { label: 'Produksi', warna: '#0EA5E9' },
  { label: 'Teknik', warna: '#F59E0B' },
  { label: 'HRD / Administrasi', warna: '#10B981' },
  { label: 'Gudang', warna: '#EF4444' },
]
</script>

<template>
  <AppLayout breadcrumb="Profil Pegawai" title="Struktur Organisasi">
    <template #search></template>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="flex flex-col justify-center items-center min-h-[500px] gap-5"
    >
      <Loader2 class="animate-spin text-sky-500" :size="45" />

      <div class="text-center">
        <p class="font-black text-slate-700">
          Memuat Struktur Organisasi...
        </p>
        <p class="text-sm text-slate-400">
          Mohon tunggu beberapa saat
        </p>
      </div>
    </div>

    <!-- ERROR -->
    <div
      v-else-if="error"
      class="flex flex-col justify-center items-center min-h-[500px] gap-5"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center"
      >
        <AlertCircle class="text-red-500" :size="32" />
      </div>

      <div class="text-center">
        <h2 class="font-black text-lg text-slate-800">
          Terjadi Kesalahan
        </h2>

        <p class="text-slate-500 mt-1">
          {{ error }}
        </p>
      </div>

      <button
        @click="refetch"
        class="px-5 py-3 rounded-xl bg-sky-500 text-white font-bold flex items-center gap-2 hover:bg-sky-600 duration-200"
      >
        <RefreshCw :size="16" />
        Muat Ulang
      </button>
    </div>

    <!-- CONTENT -->
    <div
      v-else
      class="space-y-6 pb-8 animate-fade"
    >
      <!-- HEADER -->
      <div
        class="rounded-3xl bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 p-8 text-white shadow-xl"
      >
        <div
          class="flex flex-col lg:flex-row lg:justify-between gap-6"
        >
          <!-- kiri -->
          <div class="flex gap-5">
            <div
              class="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center"
            >
              <Network :size="30" />
            </div>

            <div>
              <h1 class="text-3xl font-black">
                Struktur Organisasi
              </h1>

              <p class="text-white/80 mt-2">
                Visualisasi struktur jabatan dan hubungan organisasi
                perusahaan.
              </p>

              <div class="flex flex-wrap gap-3 mt-5">
                <div
                  class="bg-white/15 rounded-xl px-4 py-2 flex items-center gap-2"
                >
                  <Building2 :size="18" />
                  <span class="font-semibold">
                    Pabrik Gula Modern
                  </span>
                </div>

                <div
                  class="bg-white/15 rounded-xl px-4 py-2 flex items-center gap-2"
                >
                  <Users :size="18" />
                  <span class="font-semibold">
                    Organisasi Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- kanan -->
          <div class="flex items-start">
            <button
              @click="refetch"
              class="bg-white text-sky-700 font-bold rounded-xl px-5 py-3 flex items-center gap-2 hover:scale-105 duration-200"
            >
              <RefreshCw :size="18" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- LEGENDA -->
      <div
        class="bg-white rounded-3xl border border-slate-200 shadow-sm p-5"
      >
        <h3 class="font-black text-slate-700 mb-4">
          Legenda Divisi
        </h3>

        <div class="flex flex-wrap gap-4">
          <div
            v-for="item in legenda"
            :key="item.label"
            class="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2"
          >
            <span
              class="w-3 h-3 rounded-full"
              :style="{ background: item.warna }"
            />

            <span class="font-semibold text-slate-600 text-sm">
              {{ item.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- BAGAN -->
      <div
        class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div
          class="border-b border-slate-200 px-6 py-5 flex justify-between items-center"
        >
          <h3 class="font-black text-slate-700 text-lg">
            Bagan Organisasi
          </h3>

          <span
            class="bg-sky-50 text-sky-700 px-4 py-2 rounded-full text-sm font-bold"
          >
            Live Structure
          </span>
        </div>

        <div
          class="overflow-x-auto overflow-y-hidden p-10 bg-slate-50"
        >
          <div
            class="min-w-[1200px] flex justify-center"
          >
            <OrgNode
              :node="struktur"
              :warna-divisi="warnaDivisi"
              :level="0"
            />
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.animate-fade {
  animation: fade .45s ease;
}

@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar tipis */
::-webkit-scrollbar {
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

::-webkit-scrollbar-track {
  background: transparent;
}
</style>