<script setup>
/**
 * ============================================================
 *  FILE: src/manajemenabsensi/LogKehadiran.vue
 *
 *  ✅ BACKEND: Tidak perlu menyentuh file ini.
 *             Ubah data lewat endpoint API saja.
 *
 *  ✅ FRONTEND: Semua logic ada di useLogKehadiran composable.
 *              Hanya ubah tampilan (HTML/CSS) di sini.
 * ============================================================
 */

import {
  Search, Filter, Download, RefreshCw,
  AlertCircle, Loader2, X, ChevronLeft, ChevronRight,
  UserCheck, Clock, UserX, CalendarX,
  AlarmClock, LogIn, LogOut, Timer,
} from 'lucide-vue-next'

import AppLayout       from '@/components/AppLayout.vue'
import { useLogKehadiran } from '@/composables/useLogKehadiran'

const {
  loading, error,
  logs, summary, pagination, filter,
  hasFilter,
  fetchLogs, exportExcel, resetFilter, goToPage,
} = useLogKehadiran()

// ── Daftar opsi filter (statis, tidak perlu dari API) ──────
const SHIFTS  = ['Pagi', 'Siang', 'Malam']
const STATUSES = [
  { val: 'Hadir',     label: 'Hadir',     color: 'green'  },
  { val: 'Terlambat', label: 'Terlambat', color: 'amber'  },
  { val: 'Izin',      label: 'Izin',      color: 'sky'    },
  { val: 'Alpha',     label: 'Alpha',     color: 'red'    },
]

// ── Theme badge status ──────────────────────────────────────
const statusTheme = {
  Hadir:     { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
  Terlambat: { bg: '#fef9c3', border: '#fde047', text: '#a16207' },
  Izin:      { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1' },
  Alpha:     { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c' },
}

// ── Theme summary cards ─────────────────────────────────────
const summaryCards = [
  { key: 'hadir',     label: 'Hadir',     icon: UserCheck,  bg: '#dcfce7', border: '#86efac', color: '#15803d' },
  { key: 'terlambat', label: 'Terlambat', icon: AlarmClock, bg: '#fef9c3', border: '#fde047', color: '#a16207' },
  { key: 'izin',      label: 'Izin',      icon: CalendarX,  bg: '#e0f2fe', border: '#7dd3fc', color: '#0369a1' },
  { key: 'alpha',     label: 'Alpha',     icon: UserX,      bg: '#fee2e2', border: '#fca5a5', color: '#b91c1c' },
]

// ── Format tanggal tampil: "2025-06-10" → "Selasa, 10 Jun 2025"
const formatDate = (str) => {
  if (!str) return '-'
  return new Date(str).toLocaleDateString('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  })
}

// ── Halaman-halaman pagination yang ditampilkan ─────────────
const pageRange = () => {
  const cur   = pagination.value.page
  const total = pagination.value.totalPages
  const range = []
  for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) range.push(i)
  return range
}
</script>

<template>
  <AppLayout breadcrumb="Manajemen Absensi / Log Kehadiran" title="Log Kehadiran">

    <!-- ════════════════ LOADING ════════════════ -->
    <div v-if="loading && !logs.length"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <Loader2 :size="48" class="text-sky-500 animate-spin" />
      <p class="text-slate-600 font-black text-sm tracking-widest uppercase">Memuat data...</p>
    </div>

    <!-- ════════════════ ERROR ════════════════ -->
    <div v-else-if="error && !logs.length"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div class="w-16 h-16 rounded-3xl bg-red-100 border-2 border-red-300 flex items-center justify-center">
        <AlertCircle :size="32" class="text-red-500" />
      </div>
      <p class="text-slate-800 font-black text-lg">{{ error }}</p>
      <button @click="fetchLogs"
        class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white
               font-black text-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-lg">
        <RefreshCw :size="16" />
        Coba Lagi
      </button>
    </div>

    <!-- ════════════════ KONTEN ════════════════ -->
    <div v-else class="space-y-5 pb-8 page-enter">

      <!-- ── SUMMARY CARDS ──────────────────────────────── -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4" v-if="summary">
        <div
          v-for="(card, i) in summaryCards" :key="i"
          class="summary-card rounded-3xl p-5 sm:p-6 cursor-default relative overflow-hidden"
          :style="`background:${card.bg}; border:2.5px solid ${card.border}; animation-delay:${i*70}ms`"
        >
          <!-- icon pojok kanan -->
          <div class="absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center"
            :style="`background:${card.border}`">
            <component :is="card.icon" :size="20" :style="`color:${card.color}`" />
          </div>

          <p class="text-[10px] font-black uppercase tracking-widest mb-2"
            :style="`color:${card.color}`">{{ card.label }}</p>
          <h2 class="text-5xl sm:text-6xl font-black tabular-nums leading-none"
            :style="`color:${card.color}`">
            {{ summary[card.key] ?? 0 }}
          </h2>
          <p class="mt-2 text-[10px] font-black uppercase tracking-widest"
            :style="`color:${card.color};opacity:0.65`">
            dari {{ summary.total ?? 0 }} pegawai
          </p>
        </div>
      </div>

      <!-- ── FILTER & TOOLBAR ───────────────────────────── -->
      <div class="d-card">
        <div class="flex flex-wrap items-center gap-3">

          <!-- Search -->
          <div class="search-box flex-1 min-w-[180px]">
            <Search :size="15" class="search-icon" />
            <input
              v-model="filter.search"
              type="text"
              placeholder="Cari nama pegawai..."
              class="search-input"
            />
            <button v-if="filter.search" @click="filter.search = ''"
              class="search-clear">
              <X :size="13" />
            </button>
          </div>

          <!-- Tanggal -->
          <input
            v-model="filter.tanggal"
            type="date"
            class="filter-select"
            title="Filter tanggal"
          />

          <!-- Shift -->
          <select v-model="filter.shift" class="filter-select">
            <option value="">Semua Shift</option>
            <option v-for="s in SHIFTS" :key="s" :value="s">Shift {{ s }}</option>
          </select>

          <!-- Status -->
          <select v-model="filter.status" class="filter-select">
            <option value="">Semua Status</option>
            <option v-for="s in STATUSES" :key="s.val" :value="s.val">{{ s.label }}</option>
          </select>

          <!-- Spacer -->
          <div class="flex-1" />

          <!-- Reset -->
          <button v-if="hasFilter" @click="resetFilter"
            class="tool-btn tool-btn-ghost">
            <X :size="14" />
            Reset
          </button>

          <!-- Refresh -->
          <button @click="fetchLogs"
            class="tool-btn tool-btn-ghost"
            :class="{ 'animate-spin-once': loading }">
            <RefreshCw :size="14" :class="loading ? 'animate-spin' : ''" />
            Refresh
          </button>

          <!-- Export -->
          <button @click="exportExcel"
            class="tool-btn tool-btn-primary">
            <Download :size="14" />
            Export Excel
          </button>
        </div>

        <!-- Active filters indicator -->
        <div v-if="hasFilter" class="flex flex-wrap gap-2 mt-3 pt-3 border-t-2 border-slate-100">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 self-center">Filter aktif:</span>
          <span v-if="filter.tanggal" class="filter-chip">📅 {{ formatDate(filter.tanggal) }}</span>
          <span v-if="filter.shift"   class="filter-chip">🕐 Shift {{ filter.shift }}</span>
          <span v-if="filter.status"  class="filter-chip">{{ filter.status }}</span>
          <span v-if="filter.divisi"  class="filter-chip">🏭 {{ filter.divisi }}</span>
          <span v-if="filter.search"  class="filter-chip">🔍 "{{ filter.search }}"</span>
        </div>
      </div>

      <!-- ── TABEL LOG ──────────────────────────────────── -->
      <div class="d-card overflow-hidden p-0">

        <!-- Header tabel -->
        <div class="px-5 sm:px-7 py-4 border-b-2 border-slate-100 flex items-center justify-between gap-3">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Data</p>
            <h3 class="text-base font-black text-slate-800">Log Kehadiran</h3>
          </div>
          <div class="flex items-center gap-2">
            <!-- Loading inline indicator -->
            <Loader2 v-if="loading" :size="16" class="text-sky-400 animate-spin" />
            <span class="text-xs font-black text-slate-400 tabular-nums">
              {{ pagination.total }} total data
            </span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[780px]">
            <thead>
              <tr class="bg-slate-50 border-b-2 border-slate-100">
                <th class="d-th pl-6">No</th>
                <th class="d-th">NIK</th>
                <th class="d-th">Nama Pegawai</th>
                <th class="d-th">Divisi</th>
                <th class="d-th">Shift</th>
                <th class="d-th">Jam Masuk</th>
                <th class="d-th">Jam Keluar</th>
                <th class="d-th">Durasi</th>
                <th class="d-th">Status</th>
                <th class="d-th pr-6">Keterangan</th>
              </tr>
            </thead>
            <tbody>

              <!-- DATA ROWS -->
              <tr
                v-for="(log, i) in logs" :key="log.id"
                class="log-row border-b border-slate-100"
                :style="`animation-delay:${Math.min(i,10) * 40}ms`"
              >
                <!-- No -->
                <td class="d-td pl-6">
                  <span class="row-num">
                    {{ (pagination.page - 1) * pagination.perPage + i + 1 }}
                  </span>
                </td>

                <!-- NIK -->
                <td class="d-td">
                  <span class="font-black text-xs text-slate-500 tabular-nums tracking-wider">
                    {{ log.nik }}
                  </span>
                </td>

                <!-- Nama -->
                <td class="d-td">
                  <div class="flex items-center gap-2.5">
                    <div class="avatar-box">{{ log.nama?.charAt(0) }}</div>
                    <div>
                      <p class="font-black text-sm text-slate-800 whitespace-nowrap">{{ log.nama }}</p>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ formatDate(log.tanggal) }}</p>
                    </div>
                  </div>
                </td>

                <!-- Divisi -->
                <td class="d-td">
                  <span class="font-black text-xs text-slate-600">{{ log.divisi }}</span>
                </td>

                <!-- Shift -->
                <td class="d-td">
                  <span class="shift-badge"
                    :class="{
                      'shift-pagi':   log.shift === 'Pagi',
                      'shift-siang':  log.shift === 'Siang',
                      'shift-malam':  log.shift === 'Malam',
                    }">
                    {{ log.shift }}
                  </span>
                </td>

                <!-- Jam Masuk -->
                <td class="d-td">
                  <div class="flex items-center gap-1.5">
                    <LogIn :size="13" class="text-emerald-400 shrink-0" />
                    <span class="font-black text-sm tabular-nums"
                      :class="log.jam_masuk ? 'text-slate-700' : 'text-slate-300'">
                      {{ log.jam_masuk ?? '—' }}
                    </span>
                  </div>
                </td>

                <!-- Jam Keluar -->
                <td class="d-td">
                  <div class="flex items-center gap-1.5">
                    <LogOut :size="13" class="text-slate-400 shrink-0" />
                    <span class="font-black text-sm tabular-nums"
                      :class="log.jam_keluar ? 'text-slate-700' : 'text-slate-300'">
                      {{ log.jam_keluar ?? '—' }}
                    </span>
                  </div>
                </td>

                <!-- Durasi -->
                <td class="d-td">
                  <div class="flex items-center gap-1.5">
                    <Timer :size="13" class="text-sky-400 shrink-0" />
                    <span class="font-black text-xs tabular-nums"
                      :class="log.durasi ? 'text-slate-700' : 'text-slate-300'">
                      {{ log.durasi ?? '—' }}
                    </span>
                  </div>
                </td>

                <!-- Status -->
                <td class="d-td">
                  <span class="status-badge"
                    :style="statusTheme[log.status]
                      ? `background:${statusTheme[log.status].bg};border-color:${statusTheme[log.status].border};color:${statusTheme[log.status].text}`
                      : ''">
                    {{ log.status }}
                  </span>
                </td>

                <!-- Keterangan -->
                <td class="d-td pr-6">
                  <span class="text-xs font-bold text-slate-400 italic">
                    {{ log.keterangan || '—' }}
                  </span>
                </td>
              </tr>

              <!-- EMPTY STATE -->
              <tr v-if="!logs.length && !loading">
                <td colspan="10" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                      <Search :size="22" class="text-slate-400" />
                    </div>
                    <p class="font-black text-slate-400 text-sm tracking-wide">Tidak ada data ditemukan</p>
                    <button v-if="hasFilter" @click="resetFilter"
                      class="text-xs font-black text-sky-500 hover:text-sky-700 underline underline-offset-2">
                      Reset filter
                    </button>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <!-- ── PAGINATION ── -->
        <div v-if="pagination.totalPages > 1"
          class="px-5 sm:px-7 py-4 border-t-2 border-slate-100 flex items-center justify-between gap-3 flex-wrap">

          <p class="text-xs font-black text-slate-400 tabular-nums">
            Halaman {{ pagination.page }} dari {{ pagination.totalPages }}
            &nbsp;·&nbsp;
            {{ pagination.total }} data
          </p>

          <div class="flex items-center gap-1.5">
            <!-- Prev -->
            <button @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="page-btn"
              :class="pagination.page <= 1 ? 'opacity-40 cursor-not-allowed' : ''">
              <ChevronLeft :size="14" />
            </button>

            <!-- Pages -->
            <button
              v-for="p in pageRange()" :key="p"
              @click="goToPage(p)"
              class="page-btn"
              :class="p === pagination.page ? 'page-btn-active' : ''">
              {{ p }}
            </button>

            <!-- Next -->
            <button @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="page-btn"
              :class="pagination.page >= pagination.totalPages ? 'opacity-40 cursor-not-allowed' : ''">
              <ChevronRight :size="14" />
            </button>
          </div>
        </div>

      </div>
      <!-- end tabel -->

      <div class="h-4" />
    </div>
  </AppLayout>
</template>

<style scoped>

/* ══════════════════════════════════════════════════════
   PAGE ENTER
══════════════════════════════════════════════════════ */
.page-enter {
  animation: pageIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes pageIn {
  from { opacity:0; transform:translateY(14px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ══════════════════════════════════════════════════════
   SUMMARY CARDS
══════════════════════════════════════════════════════ */
.summary-card {
  animation: cardPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.09);
}
@keyframes cardPop {
  from { opacity:0; transform:scale(0.93) translateY(12px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}

/* ══════════════════════════════════════════════════════
   CARD BASE
══════════════════════════════════════════════════════ */
.d-card {
  background: #ffffff;
  border: 2.5px solid #e2e8f0;
  border-radius: 24px;
  padding: 20px 22px;
  transition: box-shadow 0.2s;
}
.d-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.05); }
@media (min-width:640px) { .d-card { padding: 24px 28px; } }

/* ══════════════════════════════════════════════════════
   SEARCH BOX
══════════════════════════════════════════════════════ */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  border: 2.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.search-input::placeholder { color: #cbd5e1; font-weight: 600; }
.search-input:focus {
  border-color: #7dd3fc;
  background: #ffffff;
}
.search-clear {
  position: absolute;
  right: 10px;
  color: #94a3b8;
  padding: 2px;
  border-radius: 6px;
  transition: color 0.15s;
}
.search-clear:hover { color: #ef4444; }

/* ══════════════════════════════════════════════════════
   FILTER SELECT
══════════════════════════════════════════════════════ */
.filter-select {
  padding: 9px 12px;
  border: 2.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 800;
  color: #334155;
  background: #f8fafc;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.filter-select:focus { border-color: #7dd3fc; }

/* ══════════════════════════════════════════════════════
   FILTER CHIP
══════════════════════════════════════════════════════ */
.filter-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 8px;
  background: #e0f2fe;
  border: 2px solid #7dd3fc;
  color: #0369a1;
  font-size: 11px;
  font-weight: 900;
}

/* ══════════════════════════════════════════════════════
   TOOLBAR BUTTONS
══════════════════════════════════════════════════════ */
.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 900;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.tool-btn:hover { transform: translateY(-1px); }
.tool-btn:active { transform: scale(0.96); }

.tool-btn-ghost {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #475569;
}
.tool-btn-ghost:hover { background: #f1f5f9; border-color: #cbd5e1; }

.tool-btn-primary {
  background: #0ea5e9;
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(14,165,233,0.25);
}
.tool-btn-primary:hover {
  background: #0284c7;
  box-shadow: 0 4px 16px rgba(14,165,233,0.35);
}

/* ══════════════════════════════════════════════════════
   TABLE
══════════════════════════════════════════════════════ */
.d-th {
  padding: 12px 10px;
  font-size: 10px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: left;
  white-space: nowrap;
}
.d-td {
  padding: 13px 10px;
  vertical-align: middle;
}

/* ══════════════════════════════════════════════════════
   LOG ROW
══════════════════════════════════════════════════════ */
.log-row {
  animation: rowIn 0.28s ease both;
  transition: background 0.12s;
}
.log-row:hover { background: #f8fafc; }
@keyframes rowIn {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ══════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════ */
.avatar-box {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg,#e0f2fe,#dbeafe);
  border: 2px solid #bae6fd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
  color: #0369a1;
  flex-shrink: 0;
}

/* ══════════════════════════════════════════════════════
   ROW NUMBER
══════════════════════════════════════════════════════ */
.row-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  border-radius: 8px;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
}

/* ══════════════════════════════════════════════════════
   SHIFT BADGE
══════════════════════════════════════════════════════ */
.shift-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 900;
  border: 2px solid;
  letter-spacing: 0.02em;
}
.shift-pagi  { background:#fef9c3; border-color:#fde047; color:#a16207; }
.shift-siang { background:#e0f2fe; border-color:#7dd3fc; color:#0369a1; }
.shift-malam { background:#ede9fe; border-color:#c4b5fd; color:#6d28d9; }

/* ══════════════════════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════════════════════ */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 900;
  border: 2px solid;
  white-space: nowrap;
}

/* ══════════════════════════════════════════════════════
   PAGINATION
══════════════════════════════════════════════════════ */
.page-btn {
  min-width: 34px; height: 34px;
  padding: 0 8px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 900;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover { background: #f1f5f9; border-color: #bae6fd; color: #0284c7; }
.page-btn-active {
  background: #0ea5e9 !important;
  border-color: #0ea5e9 !important;
  color: #ffffff !important;
}

/* ══════════════════════════════════════════════════════
   SCROLLBAR
══════════════════════════════════════════════════════ */
::-webkit-scrollbar { height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
</style>