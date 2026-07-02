<script setup>
/**
 * ============================================================
 *  FILE: src/rekrutmen/LowonganAktif.vue
 *  TUJUAN: Tampilan lowongan kerja aktif - data dari API.
 *
 *  ✅ UNTUK BACKEND: File ini TIDAK perlu disentuh. Ubah endpoint
 *  di useLowonganAktif composable.
 *  ✅ UNTUK FRONTEND: Hanya ubah tampilan (HTML/CSS) di sini.
 * ============================================================
 */

import {
  Briefcase, UserPlus, Users, TrendingUp,
  Search, ChevronDown, CalendarClock, Loader2,
  AlertCircle, RefreshCw, Plus, Lock, Building2,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import { useLowonganAktif } from '@/composables/useLowonganAktif.js'

const {
  loading, error, updating,
  searchQuery, filterStatus, statusList,
  stats, filtered,
  tutupLowongan,
  refetch,
} = useLowonganAktif()

const statIcons  = [Briefcase, UserPlus, Users, TrendingUp]
const statColors = [
  { from: '#0ea5e9', to: '#38bdf8', glow: 'rgba(14,165,233,0.15)'  },
  { from: '#10b981', to: '#34d399', glow: 'rgba(16,185,129,0.15)' },
  { from: '#8b5cf6', to: '#a78bfa', glow: 'rgba(139,92,246,0.15)' },
  { from: '#f59e0b', to: '#fbbf24', glow: 'rgba(245,158,11,0.15)' },
]
</script>

<template>
  <AppLayout breadcrumb="Rekrutmen" title="Lowongan Aktif">

    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 :size="40" class="text-sky-500 animate-spin" />
      <p class="text-slate-500 text-sm font-black tracking-wide">Memuat data lowongan...</p>
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

      <!-- ── Tombol Buka Lowongan ── -->
      <div class="flex justify-end">
        <button
          class="buka-btn flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black text-sm text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-lg"
        >
          <Plus :size="17" />
          Buka Lowongan Baru
        </button>
      </div>

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

      <!-- ── Grid Lowongan (card, bukan tabel — lebih pas untuk info posisi) ── -->
      <div class="card rounded-[24px] p-5 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 class="card-title">Daftar Lowongan Kerja</h3>
            <p class="card-sub">{{ filtered.length }} lowongan ditemukan</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari posisi..."
                class="h-9 w-48 rounded-xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-400 transition-all placeholder:font-normal placeholder:text-slate-400"
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

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div
            v-for="item in filtered" :key="item.id"
            class="lowongan-card rounded-2xl p-4 sm:p-5"
          >
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="min-w-0">
                <h4 class="font-black text-sm text-slate-800 truncate">{{ item.posisi }}</h4>
                <div class="flex items-center gap-1.5 mt-1">
                  <Building2 :size="12" class="text-slate-400 shrink-0" />
                  <p class="text-xs font-bold text-slate-400">{{ item.divisi }}</p>
                </div>
              </div>
              <span class="badge shrink-0" :class="item.status === 'Aktif' ? 'badge-green' : 'badge-slate'">
                {{ item.status }}
              </span>
            </div>

            <div class="flex items-center justify-between py-3 border-t-2 border-slate-100">
              <div class="flex items-center gap-1.5">
                <Users :size="14" class="text-sky-400" />
                <span class="text-sm font-black text-slate-700 tabular-nums">{{ item.pelamar }}</span>
                <span class="text-xs font-bold text-slate-400">pelamar</span>
              </div>
              <div class="flex items-center gap-1.5">
                <CalendarClock :size="13" class="text-slate-400" />
                <span class="text-xs font-bold text-slate-500">{{ item.deadline }}</span>
              </div>
            </div>

            <button
              v-if="item.status === 'Aktif'"
              @click="tutupLowongan(item)"
              :disabled="updating === item.id"
              class="tutup-btn w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 border-2 disabled:opacity-60"
            >
              <Loader2 v-if="updating === item.id" :size="13" class="animate-spin" />
              <Lock v-else :size="13" />
              Tutup Lowongan
            </button>
          </div>

          <p v-if="!filtered.length" class="col-span-full empty-msg">Tidak ada data yang sesuai filter.</p>
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

.lowongan-card {
  background: #f8fafc;
  border: 2px solid #f1f5f9;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
}
.lowongan-card:hover {
  background: #f0f9ff;
  border-color: #bae6fd;
  transform: translateY(-2px);
}

.badge {
  display: inline-flex; align-items: center; padding: 5px 10px; border-radius: 10px;
  font-size: 11px; font-weight: 900; border-width: 2px; border-style: solid;
}
.badge-green { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
.badge-slate { background: #f1f5f9; border-color: #e2e8f0; color: #64748b; }

.empty-msg {
  color: #cbd5e1; font-size: 0.8125rem; font-weight: 700; text-align: center; padding: 2rem 0;
}

.buka-btn {
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  box-shadow: 0 4px 20px rgba(14,165,233,0.35);
}
.buka-btn:hover { box-shadow: 0 6px 28px rgba(14,165,233,0.45); }

.tutup-btn { background: #fff1f2; border-color: #fecdd3; color: #e11d48; }
.tutup-btn:hover:not(:disabled) { background: #ffe4e6; border-color: #fda4af; }

::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
</style>