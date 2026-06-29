<script setup>
import {
  Search, ChevronDown, BarChart3, Briefcase,
  Phone, Mail, MapPin, Loader2,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import {
  useRingkasanPegawai,
  SUMMARY_CARDS,
  DIVISION_DATA,
  EMPLOYMENT_TYPES,
  FILTER_TYPES,
  FILTER_DIVISIONS,
  getTypeBadge,
  getAvatarColor,
} from '@/composables/useRingkasanPegawai'

const {
  loading,
  error,
  selectedEmployee,
  searchQuery,
  filterType,
  filterDiv,
  filteredEmployees,
  selectEmployee,
} = useRingkasanPegawai()
</script>

<template>
  <AppLayout breadcrumb="Beranda Utama" title="Ringkasan Data Pegawai">

    <!-- ── Loading ── -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 :size="40" class="text-sky-500 animate-spin" />
      <p class="text-slate-600 text-sm font-black tracking-wide">Memuat data pegawai...</p>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[400px]">
      <p class="text-red-500 text-sm font-black">{{ error }}</p>
    </div>

    <!-- ── Main ── -->
    <div v-else class="space-y-5 pb-6 page-enter">

      <!-- ════════ STAT CARDS ════════ -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="(card, i) in SUMMARY_CARDS" :key="card.title"
          class="stat-card rounded-[22px] p-5 relative overflow-hidden cursor-default"
          :style="`--glow:${card.glow}; animation-delay:${i * 80}ms`"
        >
          <!-- Blob dekoratif -->
          <div
            class="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none opacity-35"
            :style="`background: radial-gradient(circle, ${card.iconColor}, transparent 70%)`"
          />

          <div class="relative z-10">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border-2 icon-box"
              :style="`background:${card.bg}; border-color:${card.border}`"
            >
              <component :is="card.icon" :size="20" :style="`color:${card.iconColor}`" />
            </div>
            <h2
              class="text-3xl sm:text-4xl font-black tabular-nums text-slate-800 leading-none num-pop"
              :style="`animation-delay:${i * 80 + 220}ms`"
            >{{ card.value }}</h2>
            <p class="mt-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{{ card.title }}</p>
          </div>
        </div>
      </div>

      <!-- ════════ CHARTS ════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Sebaran per Divisi -->
        <div class="card-glass rounded-[24px] p-6 slide-up" style="animation-delay:120ms">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-base font-black text-slate-800 tracking-tight">Sebaran per Divisi</h3>
              <p class="text-[11px] font-black text-slate-400 mt-0.5 uppercase tracking-[0.1em]">Distribusi pegawai aktif</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
              <BarChart3 :size="18" class="text-slate-500" />
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="(div, i) in DIVISION_DATA" :key="div.name"
              class="div-row"
              :style="`animation-delay:${i * 80 + 200}ms`"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-black text-slate-800">{{ div.name }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black text-slate-800 tabular-nums">{{ div.count }}</span>
                  <span class="text-[11px] font-black px-2 py-0.5 rounded-lg" :class="div.badge">{{ div.pct }}%</span>
                </div>
              </div>
              <div class="h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  class="bar-fill h-full rounded-full bg-gradient-to-r"
                  :class="div.color"
                  :style="`--bar-pct:${div.pct}%; animation-delay:${i * 80 + 350}ms`"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Jenis Kepegawaian -->
        <div class="card-glass rounded-[24px] p-6 slide-up" style="animation-delay:200ms">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-base font-black text-slate-800 tracking-tight">Jenis Kepegawaian</h3>
              <p class="text-[11px] font-black text-slate-400 mt-0.5 uppercase tracking-[0.1em]">Komposisi tipe pegawai aktif</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
              <Briefcase :size="18" class="text-slate-500" />
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="(empType, i) in EMPLOYMENT_TYPES" :key="empType.label"
              class="emp-card rounded-2xl p-4 flex items-center justify-between"
              :style="`animation-delay:${i * 80 + 250}ms`"
            >
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full shrink-0" :class="empType.dot" />
                <div>
                  <p class="font-black text-sm text-slate-800">{{ empType.label }}</p>
                  <p class="text-[11px] font-bold text-slate-500 mt-0.5">{{ empType.sub }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-black text-xl tabular-nums" :class="empType.num">{{ empType.count }}</p>
                <p class="text-[11px] font-black text-slate-400 mt-0.5">{{ empType.pct }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════ TABLE ════════ -->
      <div class="card-glass rounded-[24px] p-5 sm:p-6 slide-up" style="animation-delay:280ms">

        <!-- Header + Filter -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 class="text-base font-black text-slate-800 tracking-tight">Daftar Pegawai</h3>
            <p class="text-[11px] font-black text-slate-400 mt-0.5 uppercase tracking-[0.1em]">
              <span class="text-sky-600">{{ filteredEmployees.length }}</span> pegawai ditemukan
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Search -->
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari pegawai..."
                class="h-9 w-48 rounded-xl border-2 border-slate-200 bg-white/80 pl-9 pr-3
                       text-sm font-bold text-slate-700 outline-none
                       focus:border-sky-400 transition-all placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <!-- Filter Tipe -->
            <div class="relative">
              <select
                v-model="filterType"
                class="h-9 rounded-xl border-2 border-slate-200 bg-white/80 pl-3 pr-8
                       text-sm font-black text-slate-700 outline-none appearance-none focus:border-sky-400 transition-all"
              >
                <option v-for="t in FILTER_TYPES" :key="t">{{ t }}</option>
              </select>
              <ChevronDown :size="13" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <!-- Filter Divisi -->
            <div class="relative">
              <select
                v-model="filterDiv"
                class="h-9 rounded-xl border-2 border-slate-200 bg-white/80 pl-3 pr-8
                       text-sm font-black text-slate-700 outline-none appearance-none focus:border-sky-400 transition-all"
              >
                <option v-for="d in FILTER_DIVISIONS" :key="d">{{ d }}</option>
              </select>
              <ChevronDown :size="13" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto -mx-1">
          <table class="w-full min-w-[700px]">
            <thead>
              <tr class="text-left">
                <th
                  v-for="h in ['Pegawai', 'Divisi', 'Jabatan', 'Tipe', 'Bergabung', 'Status']"
                  :key="h"
                  class="pb-3 px-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] whitespace-nowrap"
                >{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(emp, idx) in filteredEmployees"
                :key="emp.id"
                class="table-row border-t-2 border-slate-100 cursor-pointer"
                :class="selectedEmployee?.id === emp.id ? 'bg-sky-50/60' : ''"
                :style="`animation-delay:${Math.min(idx * 40, 600)}ms`"
                @click="selectEmployee(emp)"
              >
                <td class="py-3.5 px-2">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-9 h-9 rounded-xl bg-gradient-to-br border-2 flex items-center justify-center
                             text-xs font-black shrink-0"
                      :class="getAvatarColor(emp.name)"
                    >{{ emp.name.charAt(0) }}</div>
                    <div>
                      <p class="font-black text-sm text-slate-800">{{ emp.name }}</p>
                      <p class="text-[11px] font-black text-slate-400 tracking-wider">ID {{ String(emp.id).padStart(4, '0') }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-2 text-sm font-bold text-slate-600">{{ emp.division }}</td>
                <td class="py-3.5 px-2 text-sm font-bold text-slate-700">{{ emp.position }}</td>
                <td class="py-3.5 px-2">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-black" :class="getTypeBadge(emp.type)">{{ emp.type }}</span>
                </td>
                <td class="py-3.5 px-2 text-sm font-black text-slate-600 tabular-nums">{{ emp.joined }}</td>
                <td class="py-3.5 px-2">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border-2 border-emerald-200">
                    {{ emp.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredEmployees.length === 0" class="text-center py-12 text-slate-400 text-sm font-black tracking-widest uppercase">
            Tidak ada data yang sesuai filter.
          </div>
        </div>

        <!-- Detail Panel -->
        <transition name="detail">
          <div v-if="selectedEmployee" class="mt-4 rounded-2xl bg-sky-50 border-2 border-sky-200 p-5">
            <div class="flex items-center gap-2 mb-4">
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-br border-2 flex items-center justify-center text-xs font-black shrink-0"
                :class="getAvatarColor(selectedEmployee.name)"
              >{{ selectedEmployee.name.charAt(0) }}</div>
              <div>
                <p class="text-sm font-black text-slate-800">{{ selectedEmployee.name }}</p>
                <p class="text-[11px] font-black text-sky-600 uppercase tracking-widest">Detail Pegawai</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="detail-item flex items-center gap-2.5 rounded-xl bg-white/80 border-2 border-sky-100 px-4 py-3">
                <Phone :size="14" class="text-sky-400 shrink-0" />
                <span class="text-sm font-black text-slate-700">{{ selectedEmployee.phone }}</span>
              </div>
              <div class="detail-item flex items-center gap-2.5 rounded-xl bg-white/80 border-2 border-sky-100 px-4 py-3">
                <Mail :size="14" class="text-sky-400 shrink-0" />
                <span class="text-sm font-black text-slate-700">{{ selectedEmployee.email }}</span>
              </div>
              <div class="detail-item flex items-center gap-2.5 rounded-xl bg-white/80 border-2 border-sky-100 px-4 py-3">
                <MapPin :size="14" class="text-sky-400 shrink-0" />
                <span class="text-sm font-black text-slate-700">{{ selectedEmployee.division }} — {{ selectedEmployee.position }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="h-4" />
    </div>
  </AppLayout>
</template>

<style scoped>
/* ════════ PAGE ENTER ════════ */
.page-enter {
  animation: fadeUp 0.4s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ════════ SLIDE UP ════════ */
.slide-up {
  opacity: 0;
  animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ════════ STAT CARD ════════ */
.stat-card {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  opacity: 0;
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.stat-card:hover {
  transform: translateY(-5px) scale(1.015);
  box-shadow: 0 14px 36px var(--glow, rgba(0, 0, 0, 0.08));
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
.stat-card:hover .icon-box {
  animation: wiggle 0.4s ease;
}
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25%       { transform: rotate(-6deg); }
  75%       { transform: rotate(6deg); }
}

/* ════════ NUM POP ════════ */
.num-pop {
  opacity: 0;
  animation: numPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes numPop {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}

/* ════════ CARD GLASS ════════ */
.card-glass {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  border: 2px solid rgba(226, 232, 240, 0.95);
  transition: box-shadow 0.25s ease;
}
.card-glass:hover {
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.055);
}

/* ════════ BAR FILL ════════ */
.bar-fill {
  width: 0;
  animation: barGrow 0.9s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
}
@keyframes barGrow {
  from { width: 0; }
  to   { width: var(--bar-pct, 100%); }
}

/* ════════ DIV ROW ════════ */
.div-row {
  opacity: 0;
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.18s ease;
}
.div-row:hover { transform: translateX(4px); }

/* ════════ EMP CARD ════════ */
.emp-card {
  background: #f8fafc;
  border: 2px solid #f1f5f9;
  opacity: 0;
  animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.emp-card:hover {
  background: #f0f9ff;
  border-color: #bae6fd;
  transform: translateX(4px);
  box-shadow: 0 2px 12px rgba(14, 165, 233, 0.08);
}

/* ════════ TABLE ROW ════════ */
.table-row {
  opacity: 0;
  animation: rowIn 0.3s ease forwards;
  transition: background 0.15s ease, transform 0.15s ease;
}
.table-row:hover {
  background: rgba(240, 249, 255, 0.7);
  transform: translateX(2px);
}
@keyframes rowIn {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ════════ DETAIL PANEL TRANSITION ════════ */
.detail-enter-active { animation: detailIn  0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
.detail-leave-active { animation: detailOut 0.2s ease both; }
@keyframes detailIn {
  from { opacity: 0; transform: translateY(-8px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0);    max-height: 200px; }
}
@keyframes detailOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-6px); }
}

/* ════════ DETAIL ITEM ════════ */
.detail-item {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.detail-item:hover {
  border-color: #7dd3fc;
  box-shadow: 0 2px 10px rgba(14, 165, 233, 0.1);
}

/* ════════ SCROLLBAR HIDE ════════ */
::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
</style>