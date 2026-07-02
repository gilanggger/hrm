<script setup>
/**
 * ============================================================
 *  FILE: src/views/Insentif.vue
 *  TUJUAN: Tampilan insentif pegawai - data dari API.
 *
 *  ✅ UNTUK BACKEND: File ini TIDAK perlu disentuh. Ubah endpoint
 *  di useInsentif composable.
 *  ✅ UNTUK FRONTEND: Hanya ubah tampilan (HTML/CSS) di sini.
 * ============================================================
 */

import {
  Wallet, Users, TrendingUp, Layers,
  Search, ChevronDown, Award, Loader2,
  AlertCircle, RefreshCw, Sparkles,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import { useInsentif } from '@/composables/useInsentif'

const {
  loading, error,
  searchQuery, filterJenis, jenisList,
  stats, filtered, chartBars,
  refetch,
} = useInsentif()

const statIcons  = [Wallet, Users, TrendingUp, Layers]
const statColors = [
  { from: '#8b5cf6', to: '#a78bfa', glow: 'rgba(139,92,246,0.15)' },
  { from: '#0ea5e9', to: '#38bdf8', glow: 'rgba(14,165,233,0.15)' },
  { from: '#10b981', to: '#34d399', glow: 'rgba(16,185,129,0.15)' },
  { from: '#f59e0b', to: '#fbbf24', glow: 'rgba(245,158,11,0.15)' },
]

const jenisIcon = { Produktivitas: TrendingUp, Kehadiran: Award, Lembur: Sparkles }
const jenisBadge = {
  Produktivitas: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Kehadiran: 'bg-sky-50 text-sky-600 border-sky-200',
  Lembur: 'bg-violet-50 text-violet-600 border-violet-200',
}

const rupiah = (n) => `Rp ${n.toLocaleString('id-ID')}`
const maxChart = () => Math.max(...chartBars.value.map((b) => b.value), 1)
</script>

<template>
  <AppLayout breadcrumb="Penggajian" title="Insentif">

    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 :size="40" class="text-sky-500 animate-spin" />
      <p class="text-slate-500 text-sm font-black tracking-wide">Memuat data insentif...</p>
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

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">

        <!-- ── Tabel Insentif ── -->
        <div class="xl:col-span-2 card rounded-[24px] p-5 sm:p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 class="card-title">Daftar Insentif Pegawai</h3>
              <p class="card-sub">{{ filtered.length }} pegawai ditemukan</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <div class="relative">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari pegawai..."
                  class="h-9 w-44 rounded-xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-400 transition-all placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
              <div class="relative">
                <select
                  v-model="filterJenis"
                  class="h-9 rounded-xl border-2 border-slate-200 bg-white pl-3 pr-8 text-sm font-black text-slate-700 outline-none appearance-none focus:border-sky-400 transition-all"
                >
                  <option v-for="s in jenisList" :key="s">{{ s }}</option>
                </select>
                <ChevronDown :size="13" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="item in filtered" :key="item.id"
              class="row-item rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 group"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="avatar shrink-0">{{ item.name.charAt(0) }}</div>
                <div class="min-w-0">
                  <h4 class="row-name truncate">{{ item.name }}</h4>
                  <p class="row-sub truncate">{{ item.division }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border-2"
                  :class="jenisBadge[item.jenis]"
                >
                  <component :is="jenisIcon[item.jenis]" :size="11" />
                  {{ item.jenis }}
                </span>
                <span class="font-black text-sm text-slate-800 tabular-nums w-24 text-right">{{ rupiah(item.nominal) }}</span>
              </div>
            </div>
            <p v-if="!filtered.length" class="empty-msg">Tidak ada data yang sesuai filter.</p>
          </div>
        </div>

        <!-- ── Ringkasan per Jenis ── -->
        <div class="card rounded-[24px] p-5 sm:p-6">
          <div class="card-header">
            <div>
              <h3 class="card-title">Ringkasan per Jenis</h3>
              <p class="card-sub">Total insentif bulan ini</p>
            </div>
          </div>

          <div class="space-y-5">
            <div v-for="(bar, i) in chartBars" :key="i">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-black text-slate-800">{{ bar.label }}</span>
                <span class="text-sm font-black text-slate-600 tabular-nums">{{ rupiah(bar.value) }}</span>
              </div>
              <div class="h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="[
                    i === 0 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : '',
                    i === 1 ? 'bg-gradient-to-r from-sky-500 to-blue-400' : '',
                    i === 2 ? 'bg-gradient-to-r from-violet-500 to-purple-400' : '',
                  ]"
                  :style="`width: ${(bar.value / maxChart()) * 100}%`"
                />
              </div>
            </div>
          </div>
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

.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; gap: 0.75rem; }
.card-title { font-size: 1rem; font-weight: 900; color: #1e293b; letter-spacing: -0.01em; }
.card-sub {
  font-size: 0.7rem; font-weight: 700; color: #94a3b8; margin-top: 2px;
  text-transform: uppercase; letter-spacing: 0.06em;
}

.row-item {
  background: #f8fafc; border: 2px solid #f1f5f9;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
}
.row-item:hover { background: #f0f9ff; border-color: #bae6fd; transform: translateX(2px); }

.row-name { font-weight: 900; font-size: 0.8125rem; color: #1e293b; }
.row-sub { font-size: 0.7rem; font-weight: 700; color: #94a3b8; margin-top: 2px; }
.empty-msg { color: #cbd5e1; font-size: 0.8125rem; font-weight: 700; text-align: center; padding: 1rem 0; }

.avatar {
  width: 30px; height: 30px; border-radius: 8px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #fcd34d;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 900; color: #b45309;
}

::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
</style>