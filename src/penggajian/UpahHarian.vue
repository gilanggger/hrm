<script setup>
/**
 * ============================================================
 *  FILE: src/views/UpahHarian.vue
 *  TUJUAN: Tampilan upah pekerja harian/musiman - data dari API.
 *
 *  ✅ UNTUK BACKEND: File ini TIDAK perlu disentuh. Ubah endpoint
 *  di useUpahHarian composable.
 *  ✅ UNTUK FRONTEND: Hanya ubah tampilan (HTML/CSS) di sini.
 * ============================================================
 */

import {
  Users, CalendarDays, Wallet, Coins,
  Search, ChevronDown, Banknote, Loader2, Check,
  AlertCircle, RefreshCw,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import { useUpahHarian } from '@/composables/useUpahHarian'

const {
  loading, error, paying,
  searchQuery, filterStatus, statuses,
  stats, filtered, totalUpah,
  bayarUpah,
  refetch,
} = useUpahHarian()

const statIcons  = [Users, CalendarDays, Wallet, Coins]
const statColors = [
  { from: '#0ea5e9', to: '#38bdf8', glow: 'rgba(14,165,233,0.15)'  },
  { from: '#8b5cf6', to: '#a78bfa', glow: 'rgba(139,92,246,0.15)' },
  { from: '#10b981', to: '#34d399', glow: 'rgba(16,185,129,0.15)' },
  { from: '#f59e0b', to: '#fbbf24', glow: 'rgba(245,158,11,0.15)' },
]

const rupiah = (n) => `Rp ${n.toLocaleString('id-ID')}`
</script>

<template>
  <AppLayout breadcrumb="Penggajian" title="Upah Harian">

    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 :size="40" class="text-sky-500 animate-spin" />
      <p class="text-slate-500 text-sm font-black tracking-wide">Memuat data upah harian...</p>
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

      <!-- ── Tabel Upah Harian ── -->
      <div class="card rounded-[24px] p-5 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 class="card-title">Daftar Upah Pekerja Harian</h3>
            <p class="card-sub">{{ filtered.length }} pekerja ditemukan</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari pekerja..."
                class="h-9 w-48 rounded-xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-400 transition-all placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
            <div class="relative">
              <select
                v-model="filterStatus"
                class="h-9 rounded-xl border-2 border-slate-200 bg-white pl-3 pr-8 text-sm font-black text-slate-700 outline-none appearance-none focus:border-sky-400 transition-all"
              >
                <option v-for="s in statuses" :key="s">{{ s }}</option>
              </select>
              <ChevronDown :size="13" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div class="overflow-x-auto -mx-1">
          <table class="w-full min-w-[680px]">
            <thead>
              <tr>
                <th class="th">Pekerja</th>
                <th class="th">Hari Kerja</th>
                <th class="th">Upah / Hari</th>
                <th class="th">Total Upah</th>
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
                    <div class="avatar">{{ item.name.charAt(0) }}</div>
                    <div>
                      <p class="font-black text-sm text-slate-800">{{ item.name }}</p>
                      <p class="text-xs font-bold text-slate-400">{{ item.division }}</p>
                    </div>
                  </div>
                </td>
                <td class="td text-sm font-black text-slate-700 tabular-nums">{{ item.hariKerja }} hari</td>
                <td class="td text-sm font-bold text-slate-600 tabular-nums">{{ rupiah(item.upahPerHari) }}</td>
                <td class="td text-sm font-black text-slate-800 tabular-nums">{{ rupiah(totalUpah(item)) }}</td>
                <td class="td">
                  <span
                    class="badge"
                    :class="item.status === 'Sudah Dibayar' ? 'badge-green' : 'badge-amber'"
                  >{{ item.status }}</span>
                </td>
                <td class="td">
                  <button
                    v-if="item.status === 'Belum Dibayar'"
                    @click="bayarUpah(item)"
                    :disabled="paying === item.id"
                    class="bayar-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 border-2 disabled:opacity-60"
                  >
                    <Loader2 v-if="paying === item.id" :size="13" class="animate-spin" />
                    <Banknote v-else :size="13" />
                    Bayar
                  </button>
                  <span v-else class="flex items-center gap-1.5 text-xs font-black text-emerald-500">
                    <Check :size="14" /> Lunas
                  </span>
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

.avatar {
  width: 30px; height: 30px; border-radius: 8px;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  border: 2px solid #c4b5fd;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 900; color: #6d28d9; flex-shrink: 0;
}

.badge {
  display: inline-flex; align-items: center; padding: 5px 10px; border-radius: 10px;
  font-size: 11px; font-weight: 900; border-width: 2px; border-style: solid;
}
.badge-green { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
.badge-amber { background: #fffbeb; border-color: #fed7aa; color: #d97706; }

.bayar-btn { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
.bayar-btn:hover:not(:disabled) { background: #dcfce7; border-color: #86efac; }

::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
</style>
