<script setup>
/**
 * ============================================================
 *  FILE: src/keselamatankerja/InventarisAPD.vue
 *  TUJUAN: Tampilan inventaris Alat Pelindung Diri (APD) - data dari API.
 *
 *  ✅ UNTUK BACKEND: File ini TIDAK perlu disentuh. Ubah endpoint
 *  di useInventarisAPD composable.
 *  ✅ UNTUK FRONTEND: Hanya ubah tampilan (HTML/CSS) di sini.
 * ============================================================
 */

import {
  HardHat, PackageCheck, PackageMinus, PackageX,
  Search, ChevronDown, PlusCircle, Loader2,
  AlertCircle, RefreshCw, CalendarClock,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import { useInventarisAPD } from '@/composables/useInventarisAPD'

const {
  loading, error, updating,
  searchQuery, filterStatus, statusList,
  stats, filtered, statusStok,
  tambahStok,
  refetch,
} = useInventarisAPD()

const statIcons  = [HardHat, PackageCheck, PackageMinus, PackageX]
const statColors = [
  { from: '#0ea5e9', to: '#38bdf8', glow: 'rgba(14,165,233,0.15)'  },
  { from: '#10b981', to: '#34d399', glow: 'rgba(16,185,129,0.15)' },
  { from: '#f59e0b', to: '#fbbf24', glow: 'rgba(245,158,11,0.15)' },
  { from: '#ef4444', to: '#f87171', glow: 'rgba(239,68,68,0.15)'  },
]

const statusBadge = {
  Aman: 'badge-green',
  Menipis: 'badge-amber',
  Habis: 'badge-red',
}

const stokPercent = (item) => Math.min(Math.round((item.stok / (item.minStok * 2)) * 100), 100)
</script>

<template>
  <AppLayout breadcrumb="Keselamatan Kerja" title="Inventaris APD">

    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 :size="40" class="text-sky-500 animate-spin" />
      <p class="text-slate-500 text-sm font-black tracking-wide">Memuat data inventaris APD...</p>
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div class="w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center">
        <AlertCircle :size="28" class="text-red-500" />
      </div>
      <p class="text-slate-800 font-black text-base">{{ error }}</p>
      <button
        @click="refetch"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-black text-sm hover:bg-sky-600 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
      >
        <RefreshCw :size="15" />
        Coba Lagi
      </button>
    </div>

    <div v-else class="space-y-5 pb-6 animate-fadein">

      <!-- ── Stat Cards ── -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="(item, index) in stats" :key="index"
          class="stat-card rounded-[22px] p-5 sm:p-6 cursor-default relative overflow-hidden"
          :style="`--glow: ${statColors[index].glow}`"
          :class="`stagger-${index}`"
        >
          <div
            class="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-30"
            :style="`background: radial-gradient(circle, ${statColors[index].from}, transparent 70%)`"
          />
          <div class="relative z-10">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center mb-5 border-2"
              :style="`background: ${statColors[index].glow}; border-color: ${statColors[index].from}33`"
            >
              <component :is="statIcons[index]" :size="19" :style="`color: ${statColors[index].from}`" />
            </div>
            <h2 class="text-2xl sm:text-3xl font-black tabular-nums text-slate-800 leading-none">
              {{ item.value }}
            </h2>
            <p class="mt-2 text-slate-500 text-xs font-black uppercase tracking-widest">
              {{ item.title }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Tabel Inventaris APD ── -->
      <div class="card rounded-[24px] p-5 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 class="card-title">Stok Alat Pelindung Diri</h3>
            <p class="card-sub">{{ filtered.length }} jenis APD ditemukan</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari APD..."
                class="h-9 w-44 rounded-xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-400 transition-all placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
            <div class="relative">
              <select
                v-model="filterStatus"
                class="h-9 rounded-xl border-2 border-slate-200 bg-white pl-3 pr-8 text-sm font-black text-slate-700 outline-none appearance-none focus:border-sky-400 transition-all"
              >
                <option v-for="s in statusList" :key="s">{{ s }}</option>
              </select>
              <ChevronDown :size="13" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div class="overflow-x-auto -mx-1">
          <table class="w-full min-w-[760px]">
            <thead>
              <tr>
                <th class="th">Nama APD</th>
                <th class="th">Kategori</th>
                <th class="th">Stok</th>
                <th class="th">Kadaluarsa</th>
                <th class="th">Status</th>
                <th class="th"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filtered" :key="item.id"
                class="border-t-2 border-slate-100 hover:bg-slate-50 transition-colors duration-150"
              >
                <td class="td">
                  <div class="flex items-center gap-2.5">
                    <div class="icon-box">
                      <HardHat :size="15" class="text-sky-500" />
                    </div>
                    <span class="font-black text-sm text-slate-800">{{ item.nama }}</span>
                  </div>
                </td>
                <td class="td text-sm font-bold text-slate-600">{{ item.kategori }}</td>
                <td class="td">
                  <div class="flex items-center gap-2 w-32">
                    <div class="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      <div
                        class="h-full rounded-full transition-all duration-700"
                        :class="statusStok(item) === 'Habis' ? 'bg-red-400' : statusStok(item) === 'Menipis' ? 'bg-amber-400' : 'bg-emerald-400'"
                        :style="`width: ${stokPercent(item)}%`"
                      />
                    </div>
                    <span class="font-black text-sm text-slate-700 tabular-nums">{{ item.stok }}</span>
                  </div>
                </td>
                <td class="td">
                  <div class="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                    <CalendarClock :size="13" class="text-slate-400 shrink-0" />
                    {{ item.kadaluarsa }}
                  </div>
                </td>
                <td class="td">
                  <span class="badge" :class="statusBadge[statusStok(item)]">{{ statusStok(item) }}</span>
                </td>
                <td class="td">
                  <button
                    @click="tambahStok(item)"
                    :disabled="updating === item.id"
                    class="tambah-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 border-2 disabled:opacity-60"
                  >
                    <Loader2 v-if="updating === item.id" :size="13" class="animate-spin" />
                    <PlusCircle v-else :size="13" />
                    Tambah Stok
                  </button>
                </td>
              </tr>
              <tr v-if="!filtered.length">
                <td colspan="6" class="py-8 text-center text-slate-400 text-sm font-black">
                  Tidak ada data yang sesuai filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="h-4" />
    </div>
  </AppLayout>
</template>

<style scoped>
.animate-fadein { animation: fadeInUp 0.4s ease both; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stat-card {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  animation: cardIn 0.45s ease both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
.stagger-0 { animation-delay: 0ms; }
.stagger-1 { animation-delay: 70ms; }
.stagger-2 { animation-delay: 140ms; }
.stagger-3 { animation-delay: 210ms; }
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card { background: #ffffff; border: 2px solid #e2e8f0; transition: box-shadow 0.2s; }
.card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.05); }

.card-title { font-size: 1rem; font-weight: 900; color: #1e293b; letter-spacing: -0.01em; }
.card-sub {
  font-size: 0.7rem; font-weight: 700; color: #94a3b8; margin-top: 2px;
  text-transform: uppercase; letter-spacing: 0.06em;
}

.th {
  padding-bottom: 1rem; padding-left: 4px; padding-right: 4px;
  font-size: 0.65rem; font-weight: 900; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.1em; text-align: left;
}
.td { padding: 0.875rem 4px; }

.icon-box {
  width: 30px; height: 30px; border-radius: 8px;
  background: #eff6ff; border: 2px solid #bfdbfe;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.badge {
  display: inline-flex; align-items: center; padding: 5px 10px; border-radius: 10px;
  font-size: 11px; font-weight: 900; border-width: 2px; border-style: solid;
}
.badge-green { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
.badge-amber { background: #fffbeb; border-color: #fed7aa; color: #d97706; }
.badge-red   { background: #fff1f2; border-color: #fecdd3; color: #e11d48; }

.tambah-btn { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
.tambah-btn:hover:not(:disabled) { background: #dbeafe; border-color: #93c5fd; }

::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
</style>