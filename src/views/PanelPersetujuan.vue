<script setup>
import { usePanelPersetujuan } from '@/composables/usePanelPersetujuan'
import AppLayout from '@/components/AppLayout.vue'
import {
  Check, X, CalendarDays, FileText,
  ChevronDown, Search, RefreshCw, AlertCircle,
  Loader2,
} from 'lucide-vue-next'

const {
  loading, error,
  filterStatus, filterType, searchQuery,
  statuses, types,
  filtered, pendingCount, summaryStats,
  rejectReason, showRejectModal,
  approve, reject, confirmReject,
  statusClass, typeIcon,
  refetch,
} = usePanelPersetujuan()

/* ── stat card config ──────────────────────────────────────── */
const statCards = [
  { key: 'Menunggu',  color: 'amber'   },
  { key: 'Disetujui', color: 'emerald' },
  { key: 'Ditolak',   color: 'red'     },
  { key: 'Total',     color: 'indigo'  },
]

const statCfg = {
  amber:   {
    border: 'border-l-amber-400',
    num:    'text-amber-500',
    dot:    'bg-amber-400',
    glow:   'rgba(245,158,11,0.20)',
    blob:   '#f59e0b',
  },
  emerald: {
    border: 'border-l-emerald-400',
    num:    'text-emerald-600',
    dot:    'bg-emerald-400',
    glow:   'rgba(16,185,129,0.20)',
    blob:   '#10b981',
  },
  red: {
    border: 'border-l-red-400',
    num:    'text-red-500',
    dot:    'bg-red-400',
    glow:   'rgba(239,68,68,0.20)',
    blob:   '#ef4444',
  },
  indigo: {
    border: 'border-l-indigo-400',
    num:    'text-indigo-600',
    dot:    'bg-indigo-400',
    glow:   'rgba(99,102,241,0.20)',
    blob:   '#6366f1',
  },
}

function statusPill(s) {
  return {
    Menunggu:  'text-amber-700   bg-amber-50   ring-amber-200',
    Disetujui: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
    Ditolak:   'text-red-600     bg-red-50     ring-red-200',
  }[s] ?? ''
}

function typePill(t) {
  return {
    'Cuti Tahunan':    'text-sky-800    bg-sky-50    border border-sky-200',
    'Lembur':          'text-violet-800 bg-violet-50 border border-violet-200',
    'Izin Sakit':      'text-rose-800   bg-rose-50   border border-rose-200',
    'Izin Khusus':     'text-orange-800 bg-orange-50 border border-orange-200',
    'Cuti Melahirkan': 'text-teal-800   bg-teal-50   border border-teal-200',
  }[t] ?? 'text-slate-700 bg-slate-100 border border-slate-200'
}

function leftBorder(t) {
  return {
    'Cuti Tahunan':    'before:bg-sky-400',
    'Lembur':          'before:bg-violet-400',
    'Izin Sakit':      'before:bg-rose-400',
    'Izin Khusus':     'before:bg-orange-400',
    'Cuti Melahirkan': 'before:bg-teal-400',
  }[t] ?? 'before:bg-slate-300'
}

function iconColor(t) {
  return {
    'Cuti Tahunan':    'text-sky-600    bg-sky-50    border-2 border-sky-200',
    'Lembur':          'text-violet-600 bg-violet-50 border-2 border-violet-200',
    'Izin Sakit':      'text-rose-600   bg-rose-50   border-2 border-rose-200',
    'Izin Khusus':     'text-orange-600 bg-orange-50 border-2 border-orange-200',
    'Cuti Melahirkan': 'text-teal-600   bg-teal-50   border-2 border-teal-200',
  }[t] ?? 'text-slate-600 bg-slate-100 border-2 border-slate-200'
}
</script>

<template>
  <AppLayout breadcrumb="Beranda Utama" title="Panel Persetujuan">

    <template #badge>
      <span
        v-if="pendingCount > 0"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
               bg-amber-50 text-amber-700 text-xs font-black ring-2 ring-amber-200"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        {{ pendingCount }} Menunggu
      </span>
    </template>

    <template #default>

      <!-- ════════════════════════════════════════
           REJECT MODAL
      ════════════════════════════════════════ -->
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-150"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRejectModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background:rgba(15,23,42,.5); backdrop-filter:blur(6px)"
        >
          <Transition
            enter-active-class="transition duration-200"
            enter-from-class="opacity-0 scale-90"
            enter-to-class="opacity-100 scale-100"
          >
            <div class="modal-card bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border-2 border-slate-100">
              <div class="flex items-start gap-3 mb-5">
                <span class="mt-0.5 w-9 h-9 rounded-xl bg-red-50 border-2 border-red-200
                             flex items-center justify-center text-red-500 shrink-0">
                  <X :size="17" />
                </span>
                <div>
                  <p class="font-black text-slate-800 text-sm tracking-tight">Tolak pengajuan ini?</p>
                  <p class="text-xs font-bold text-slate-400 mt-0.5">Alasan akan dikirimkan ke pegawai.</p>
                </div>
              </div>
              <textarea
                v-model="rejectReason[showRejectModal]"
                rows="3"
                placeholder="Tuliskan alasan penolakan…"
                class="w-full border-2 border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5
                       text-sm font-bold resize-none outline-none
                       focus:ring-2 focus:ring-red-300 focus:border-red-300 focus:bg-white
                       transition text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
              />
              <div class="flex gap-2 mt-4">
                <button
                  class="flex-1 h-10 rounded-xl text-sm font-black text-slate-600
                         border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300
                         active:scale-95 transition-all duration-150"
                  @click="showRejectModal = null"
                >Batal</button>
                <button
                  class="flex-1 h-10 rounded-xl text-sm font-black text-white
                         bg-red-500 hover:bg-red-600 border-2 border-red-500 hover:border-red-600
                         hover:-translate-y-0.5 active:scale-95 transition-all duration-150"
                  @click="confirmReject"
                >Tolak Pengajuan</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>

      <!-- ════════════════════════════════════════
           LOADING
      ════════════════════════════════════════ -->
      <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 :size="40" class="text-sky-500 animate-spin" />
        <p class="text-slate-600 text-sm font-black tracking-wide">Memuat data persetujuan...</p>
      </div>

      <!-- ════════════════════════════════════════
           MAIN
      ════════════════════════════════════════ -->
      <div v-else class="space-y-5 pb-6 page-enter">

        <!-- ── STAT CARDS ── -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="(stat, i) in summaryStats" :key="i"
            class="stat-card rounded-[20px] border-l-4 px-5 py-4 relative overflow-hidden cursor-default"
            :class="statCfg[statCards[i].color].border"
            :style="`--glow:${statCfg[statCards[i].color].glow}; animation-delay:${i * 80}ms`"
          >
            <!-- Blob -->
            <div
              class="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none opacity-30"
              :style="`background: radial-gradient(circle, ${statCfg[statCards[i].color].blob}, transparent 70%)`"
            />

            <div class="relative z-10 flex items-center gap-3">
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0 dot-pulse"
                :class="statCfg[statCards[i].color].dot"
              />
              <div class="min-w-0">
                <p class="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] leading-none mb-1.5">
                  {{ stat.title }}
                </p>
                <p
                  class="text-3xl font-black leading-none tabular-nums num-pop"
                  :class="statCfg[statCards[i].color].num"
                  :style="`animation-delay:${i * 80 + 220}ms`"
                >
                  {{ stat.value }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── FILTER BAR ── -->
        <div class="card-glass rounded-[20px] px-5 py-4 slide-up" style="animation-delay:120ms">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-baseline gap-2">
              <span class="text-sm font-black text-slate-800 tracking-tight">Daftar Pengajuan</span>
              <span class="text-xs font-black text-slate-400">
                <span class="text-sky-600">{{ filtered.length }}</span> ditemukan
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <!-- Search -->
              <div class="relative">
                <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari nama / tipe…"
                  class="h-9 w-48 rounded-xl border-2 border-slate-200 bg-white/80 pl-9 pr-3
                         text-xs font-bold text-slate-700 outline-none
                         focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all
                         placeholder:font-normal placeholder:text-slate-300"
                />
              </div>

              <!-- Filter Status -->
              <div class="relative">
                <select
                  v-model="filterStatus"
                  class="h-9 rounded-xl border-2 border-slate-200 bg-white/80 pl-3 pr-8
                         text-xs font-black text-slate-700 appearance-none outline-none
                         focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all cursor-pointer"
                >
                  <option v-for="s in statuses" :key="s">{{ s }}</option>
                </select>
                <ChevronDown :size="12" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <!-- Filter Type -->
              <div class="relative">
                <select
                  v-model="filterType"
                  class="h-9 rounded-xl border-2 border-slate-200 bg-white/80 pl-3 pr-8
                         text-xs font-black text-slate-700 appearance-none outline-none
                         focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all cursor-pointer"
                >
                  <option v-for="t in types" :key="t">{{ t }}</option>
                </select>
                <ChevronDown :size="12" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <!-- Refresh -->
              <button
                class="h-9 w-9 rounded-xl border-2 border-slate-200 bg-white/80
                       flex items-center justify-center text-slate-400
                       hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300
                       hover:rotate-180 active:scale-90
                       transition-all duration-300"
                :class="{ 'opacity-50 pointer-events-none': loading }"
                @click="refetch"
                title="Muat ulang"
              >
                <RefreshCw :size="14" :class="{ 'animate-spin': loading }" />
              </button>
            </div>
          </div>
        </div>

        <!-- ── ERROR ── -->
        <div
          v-if="error"
          class="bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-3.5 flex items-center gap-3 slide-up"
        >
          <AlertCircle :size="16" class="text-red-500 shrink-0" />
          <p class="text-sm font-black text-red-700 flex-1">{{ error }}</p>
          <button
            class="text-xs font-black text-red-500 hover:text-red-700 transition-colors"
            @click="refetch"
          >Coba lagi</button>
        </div>

        <!-- ── LIST ── -->
        <div class="space-y-2">

          <!-- Skeleton -->
          <template v-if="loading">
            <div
              v-for="n in 3" :key="n"
              class="bg-white rounded-2xl border-2 border-slate-100 px-5 py-4 flex gap-3 animate-pulse"
            >
              <div class="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div class="flex-1 space-y-2.5 py-0.5">
                <div class="h-3.5 w-40 rounded-lg bg-slate-100" />
                <div class="h-2.5 w-60 rounded-lg bg-slate-100" />
                <div class="h-2 w-48 rounded-lg bg-slate-100" />
              </div>
              <div class="w-20 space-y-2 py-0.5">
                <div class="h-6 rounded-full bg-slate-100" />
              </div>
            </div>
          </template>

          <template v-else>
            <TransitionGroup
              enter-active-class="transition duration-250 ease-out"
              enter-from-class="opacity-0 translate-y-2 scale-98"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-180 ease-in"
              leave-to-class="opacity-0 -translate-x-4"
            >
              <div
                v-for="(item, idx) in filtered"
                :key="item.id"
                class="list-item relative bg-white rounded-2xl border-2 border-slate-100 overflow-hidden
                       before:absolute before:left-0 before:top-0 before:h-full before:w-[4px]"
                :class="leftBorder(item.type)"
                :style="`animation-delay:${Math.min(idx * 50, 500)}ms`"
              >
                <div class="pl-6 pr-5 py-4 flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-4">

                  <!-- Icon -->
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200"
                    :class="iconColor(item.type)"
                  >
                    <component :is="typeIcon(item.type)" :size="17" />
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span class="text-sm font-black text-slate-800">{{ item.name }}</span>
                      <span class="px-2 py-0.5 rounded-lg text-[11px] font-black bg-slate-100 border border-slate-200 text-slate-600">
                        {{ item.division }}
                      </span>
                      <span
                        class="px-2 py-0.5 rounded-lg text-[11px] font-black"
                        :class="typePill(item.type)"
                      >{{ item.type }}</span>
                    </div>

                    <p class="text-xs font-bold text-slate-500 mb-2 truncate">{{ item.reason }}</p>

                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-black text-slate-400">
                      <span class="flex items-center gap-1">
                        <CalendarDays :size="11" />
                        {{ item.start }} → {{ item.end }}
                      </span>
                      <span class="flex items-center gap-1">
                        <FileText :size="11" />
                        {{ item.days }} hari
                      </span>
                      <span>Diajukan {{ item.submitted }}</span>
                    </div>
                  </div>

                  <!-- Right: status + action -->
                  <div class="flex xl:flex-col items-center xl:items-end gap-2 shrink-0">
                    <span
                      class="px-3 py-1 rounded-full text-[11px] font-black ring-2 whitespace-nowrap"
                      :class="statusPill(item.status)"
                    >{{ item.status }}</span>

                    <div v-if="item.status === 'Menunggu'" class="flex gap-1.5">
                      <button
                        class="flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[11px] font-black text-white
                               bg-emerald-500 border-2 border-emerald-500
                               hover:bg-emerald-600 hover:border-emerald-600
                               hover:-translate-y-0.5 active:scale-95
                               transition-all duration-150"
                        @click="approve(item.id)"
                      >
                        <Check :size="12" /> Setujui
                      </button>
                      <button
                        class="flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[11px] font-black text-white
                               bg-red-500 border-2 border-red-500
                               hover:bg-red-600 hover:border-red-600
                               hover:-translate-y-0.5 active:scale-95
                               transition-all duration-150"
                        @click="reject(item.id)"
                      >
                        <X :size="12" /> Tolak
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </TransitionGroup>

            <!-- Empty -->
            <div
              v-if="filtered.length === 0"
              class="card-glass rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center slide-up"
            >
              <div class="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-slate-200
                          flex items-center justify-center mx-auto mb-4">
                <Search :size="18" class="text-slate-300" />
              </div>
              <p class="text-sm font-black text-slate-500 tracking-tight">Tidak ada pengajuan</p>
              <p class="text-xs font-black text-slate-300 mt-1 uppercase tracking-widest">Coba ubah filter pencarian</p>
            </div>
          </template>

        </div>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>

/* ════════════════════════════════════════════════════════════
   PAGE ENTER
════════════════════════════════════════════════════════════ */
.page-enter {
  animation: fadeUp 0.4s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ════════════════════════════════════════════════════════════
   SLIDE UP
════════════════════════════════════════════════════════════ */
.slide-up {
  opacity: 0;
  animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ════════════════════════════════════════════════════════════
   STAT CARD
════════════════════════════════════════════════════════════ */
.stat-card {
  background: #ffffff;
  border-top: 2px solid #e2e8f0;
  border-right: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
  opacity: 0;
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.stat-card:hover {
  transform: translateY(-5px) scale(1.015);
  box-shadow: 0 14px 36px var(--glow, rgba(0,0,0,0.08));
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* ════════════════════════════════════════════════════════════
   DOT PULSE (stat card)
════════════════════════════════════════════════════════════ */
.dot-pulse {
  animation: dotPulse 2s ease-in-out infinite;
}
@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
  50%       { box-shadow: 0 0 0 5px transparent; opacity: 0.7; }
}

/* ════════════════════════════════════════════════════════════
   NUMBER POP
════════════════════════════════════════════════════════════ */
.num-pop {
  opacity: 0;
  animation: numPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes numPop {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}

/* ════════════════════════════════════════════════════════════
   CARD GLASS
════════════════════════════════════════════════════════════ */
.card-glass {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  border: 2px solid rgba(226, 232, 240, 0.95);
  transition: box-shadow 0.25s ease;
}
.card-glass:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05);
}

/* ════════════════════════════════════════════════════════════
   LIST ITEM
════════════════════════════════════════════════════════════ */
.list-item {
  opacity: 0;
  animation: rowIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.list-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transform: translateX(3px);
}
/* Icon scale on row hover */
.list-item:hover .icon-box-inner {
  transform: scale(1.1);
}
@keyframes rowIn {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ════════════════════════════════════════════════════════════
   MODAL CARD ENTRANCE
════════════════════════════════════════════════════════════ */
.modal-card {
  animation: modalIn 0.22s cubic-bezier(0.34, 1.3, 0.64, 1) both;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.88) translateY(10px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

/* ════════════════════════════════════════════════════════════
   SCALE 98 (TransitionGroup enter)
════════════════════════════════════════════════════════════ */
.scale-98 { transform: scale(0.98); }

/* ════════════════════════════════════════════════════════════
   SCROLLBAR HIDE
════════════════════════════════════════════════════════════ */
::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
</style>