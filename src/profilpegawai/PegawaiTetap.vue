<script setup>
/**
 * ============================================================
 *  FILE: src/profilpegawai/PegawaiTetap.vue
 * ============================================================
 */

import {
  Users, UserCheck, CalendarClock, UserX,
  Search, ChevronDown, Loader2, AlertCircle, RefreshCw, GraduationCap,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import { usePegawai } from '@/composables/usePegawai'

const {
  loading, error,
  searchQuery, filterDivisi, filterStatus,
  divisiOptions, statusOptions,
  stats, filtered,
  refetch,
} = usePegawai('tetap')

const statIcons     = [Users, UserCheck, CalendarClock, UserX]
const statIconColor = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444']
const statBg        = [
  'rgba(14,165,233,0.12)',
  'rgba(16,185,129,0.12)',
  'rgba(245,158,11,0.12)',
  'rgba(239,68,68,0.12)',
]
const statBorder = [
  'rgba(14,165,233,0.30)',
  'rgba(16,185,129,0.30)',
  'rgba(245,158,11,0.30)',
  'rgba(239,68,68,0.30)',
]
const statGlow = [
  'rgba(14,165,233,0.22)',
  'rgba(16,185,129,0.22)',
  'rgba(245,158,11,0.22)',
  'rgba(239,68,68,0.22)',
]

const statusColor = (status) => {
  const map = {
    'Aktif':     'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Cuti':      'bg-sky-50     text-sky-700     border border-sky-200',
    'Nonaktif':  'bg-red-50     text-red-600     border border-red-200',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}
</script>

<template>
  <AppLayout breadcrumb="Profil Pegawai" title="Pegawai Tetap">
    <template #search></template>

    <!-- ── Loading ── -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 :size="40" class="text-sky-500 animate-spin" />
      <p class="text-slate-600 text-sm font-black tracking-wide">Memuat data pegawai tetap...</p>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div class="w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center">
        <AlertCircle :size="28" class="text-red-500" />
      </div>
      <p class="text-slate-800 font-black text-base">{{ error }}</p>
      <button
        @click="refetch"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-black text-sm
               hover:bg-sky-600 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
      >
        <RefreshCw :size="15" />
        Coba Lagi
      </button>
    </div>

    <!-- ── Main Content ── -->
    <div v-else class="space-y-5 pb-6 page-enter">

      <!-- ════════════════════════════════════════
           STAT CARDS
      ════════════════════════════════════════ -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="(item, i) in stats" :key="i"
          class="stat-card rounded-[22px] p-5 relative overflow-hidden cursor-default"
          :style="`--glow:${statGlow[i]}; animation-delay:${i * 80}ms`"
        >
          <div
            class="absolute -top-7 -right-7 w-32 h-32 rounded-full pointer-events-none opacity-35"
            :style="`background: radial-gradient(circle, ${statIconColor[i]} 0%, transparent 70%)`"
          />
          <div class="relative z-10">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border-2 icon-box"
              :style="`background:${statBg[i]}; border-color:${statBorder[i]}`"
            >
              <component :is="statIcons[i]" :size="20" :style="`color:${statIconColor[i]}`" />
            </div>
            <h2
              class="text-3xl sm:text-4xl font-black tabular-nums text-slate-800 leading-none num-pop"
              :style="`animation-delay:${i * 80 + 200}ms`"
            >
              {{ item.value }}
            </h2>
            <p class="mt-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
              {{ item.title }}
            </p>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════
           TABEL PEGAWAI TETAP
      ════════════════════════════════════════ -->
      <div class="card-glass rounded-[24px] p-5 sm:p-6 slide-up" style="animation-delay:150ms">

        <!-- Header + Filter -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 class="text-base font-black text-slate-800 tracking-tight">Data Pegawai Tetap</h3>
            <p class="text-[11px] font-black text-slate-400 mt-0.5 uppercase tracking-[0.1em]">
              <span class="text-sky-600">{{ filtered.length }}</span> pegawai ditemukan
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Search -->
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama / NIK..."
                class="h-9 w-48 rounded-xl border-2 border-slate-200 bg-white/80 pl-9 pr-3
                       text-sm font-bold text-slate-700 outline-none
                       focus:border-sky-400 transition-all placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <!-- Filter Divisi -->
            <div class="relative">
              <select
                v-model="filterDivisi"
                class="h-9 rounded-xl border-2 border-slate-200 bg-white/80 pl-3 pr-8
                       text-sm font-black text-slate-700 outline-none appearance-none focus:border-sky-400 transition-all"
              >
                <option v-for="d in divisiOptions" :key="d">{{ d }}</option>
              </select>
              <ChevronDown :size="13" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <!-- Filter Status -->
            <div class="relative">
              <select
                v-model="filterStatus"
                class="h-9 rounded-xl border-2 border-slate-200 bg-white/80 pl-3 pr-8
                       text-sm font-black text-slate-700 outline-none appearance-none focus:border-sky-400 transition-all"
              >
                <option v-for="s in statusOptions" :key="s">{{ s }}</option>
              </select>
              <ChevronDown :size="13" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <!-- Tabel -->
        <div class="overflow-x-auto -mx-1">
          <table class="w-full min-w-[820px]">
            <thead>
              <tr class="text-left">
                <th v-for="h in ['NIK','Nama Pegawai','Divisi','Jabatan','Tgl Masuk','Masa Kerja','Pendidikan','Status']"
                    :key="h"
                    class="pb-3 px-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] whitespace-nowrap"
                >{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, idx) in filtered" :key="item.id"
                class="table-row border-t-2 border-slate-100"
                :style="`animation-delay:${Math.min(idx * 35, 600)}ms`"
              >
                <td class="py-3.5 px-2 font-mono text-sm font-black text-slate-500">{{ item.nik }}</td>
                <td class="py-3.5 px-2">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100
                                border-2 border-sky-200 flex items-center justify-center
                                text-xs font-black text-sky-700 shrink-0">
                      {{ item.nama.charAt(0) }}
                    </div>
                    <span class="font-black text-sm text-slate-800 whitespace-nowrap">{{ item.nama }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-2 text-sm font-bold text-slate-600 whitespace-nowrap">{{ item.divisi }}</td>
                <td class="py-3.5 px-2">
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 border-2 border-slate-200 text-slate-700 text-xs font-black whitespace-nowrap">
                    {{ item.jabatan }}
                  </span>
                </td>
                <td class="py-3.5 px-2 text-sm font-bold text-slate-600 whitespace-nowrap">{{ item.tanggalMasuk }}</td>
                <td class="py-3.5 px-2 text-sm font-black text-slate-800 tabular-nums whitespace-nowrap">{{ item.masaKerja }}</td>
                <td class="py-3.5 px-2">
                  <span class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 whitespace-nowrap">
                    <GraduationCap :size="13" class="text-slate-400" />
                    {{ item.pendidikan }}
                  </span>
                </td>
                <td class="py-3.5 px-2">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-black whitespace-nowrap" :class="statusColor(item.status)">
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filtered.length === 0" class="text-center py-12 text-slate-400 text-sm font-black tracking-widest uppercase">
            Tidak ada data yang sesuai filter.
          </div>
        </div>
      </div>

      <div class="h-4" />
    </div>
  </AppLayout>
</template>

<style scoped>
.page-enter { animation: fadeUp 0.4s ease both; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.slide-up { opacity: 0; animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
@keyframes slideUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }

.stat-card {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  opacity: 0;
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.stat-card:hover { transform: translateY(-5px) scale(1.015); box-shadow: 0 14px 36px var(--glow, rgba(0,0,0,0.08)); }
@keyframes cardIn { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
.stat-card:hover .icon-box { animation: wiggle 0.4s ease; }
@keyframes wiggle { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }

.num-pop { opacity: 0; animation: numPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes numPop { from { opacity: 0; transform: scale(0.65); } to { opacity: 1; transform: scale(1); } }

.card-glass {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  border: 2px solid rgba(226, 232, 240, 0.95);
  transition: box-shadow 0.25s ease;
}
.card-glass:hover { box-shadow: 0 6px 28px rgba(0, 0, 0, 0.055); }

.table-row {
  opacity: 0;
  animation: rowIn 0.3s ease forwards;
  transition: background 0.15s ease, transform 0.15s ease;
}
.table-row:hover { background: rgba(248, 250, 252, 0.8); transform: translateX(2px); }
@keyframes rowIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
</style>