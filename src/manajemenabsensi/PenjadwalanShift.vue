<script setup>
/**
 * ============================================================
 *  FILE: src/manajemenabsensi/PenjadwalanShift.vue
 *
 *  ✅ BACKEND: Tidak perlu menyentuh file ini.
 *             Ubah data lewat endpoint API saja.
 *
 *  ✅ FRONTEND: Semua logic ada di usePenjadwalanShift.js
 *              Hanya ubah tampilan (HTML/CSS) di sini.
 * ============================================================
 */

import {
  ChevronLeft, ChevronRight, Calendar, RefreshCw,
  AlertCircle, Loader2, Pencil, Save, X,
  Users, Sun, Sunset, Moon, Coffee,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import { usePenjadwalanShift } from '@/composables/usePenjadwalanShift'

const {
  loading, error, saveLoading,
  days, filteredList, summary,
  weekLabel, editMode,
  filterDivisi, filterSearch,
  DIVISI_LIST, SHIFT_DEF,
  prevWeek, nextWeek, goToday,
  setShift, saveJadwal, fetchJadwal,
} = usePenjadwalanShift()

// ── Shift theme ────────────────────────────────────────────
const SHIFT_THEME = {
  Pagi:  { bg:'#fef9c3', border:'#fde047', text:'#a16207', icon: Sun    },
  Siang: { bg:'#e0f2fe', border:'#7dd3fc', text:'#0369a1', icon: Sunset },
  Malam: { bg:'#ede9fe', border:'#c4b5fd', text:'#6d28d9', icon: Moon   },
  Libur: { bg:'#f1f5f9', border:'#e2e8f0', text:'#94a3b8', icon: Coffee },
}

// Summary card theme
const SUMMARY_THEME = [
  { key:'pagi',  label:'Pagi',  icon: Sun,    bg:'#fef9c3', border:'#fde047', color:'#a16207' },
  { key:'siang', label:'Siang', icon: Sunset, bg:'#e0f2fe', border:'#7dd3fc', color:'#0369a1' },
  { key:'malam', label:'Malam', icon: Moon,   bg:'#ede9fe', border:'#c4b5fd', color:'#6d28d9' },
  { key:'libur', label:'Libur', icon: Coffee, bg:'#f1f5f9', border:'#e2e8f0', color:'#94a3b8' },
]

// Total per-shift dari semua hari minggu ini
const weekTotal = (key) => {
  if (!summary.value?.length) return 0
  return summary.value.reduce((acc, d) => acc + (d[key] ?? 0), 0)
}
</script>

<template>
  <AppLayout breadcrumb="Manajemen Absensi / Penjadwalan Shift" title="Penjadwalan Shift">

    <!-- ════════ LOADING ════════ -->
    <div v-if="loading && !filteredList.length"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <Loader2 :size="48" class="text-sky-500 animate-spin" />
      <p class="text-slate-600 font-black text-sm tracking-widest uppercase">Memuat jadwal...</p>
    </div>

    <!-- ════════ ERROR ════════ -->
    <div v-else-if="error && !filteredList.length"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div class="w-16 h-16 rounded-3xl bg-red-100 border-2 border-red-300 flex items-center justify-center">
        <AlertCircle :size="32" class="text-red-500" />
      </div>
      <p class="text-slate-800 font-black text-lg">{{ error }}</p>
      <button @click="fetchJadwal"
        class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white
               font-black text-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-lg">
        <RefreshCw :size="16" />
        Coba Lagi
      </button>
    </div>

    <!-- ════════ KONTEN ════════ -->
    <div v-else class="space-y-5 pb-8 page-enter">

      <!-- ── SUMMARY CARDS ── -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="(card, i) in SUMMARY_THEME" :key="i"
          class="sum-card rounded-3xl p-5 sm:p-6 relative overflow-hidden cursor-default"
          :style="`background:${card.bg}; border:2.5px solid ${card.border}; animation-delay:${i*70}ms`"
        >
          <div class="absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center"
            :style="`background:${card.border}`">
            <component :is="card.icon" :size="19" :style="`color:${card.color}`" />
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest mb-2" :style="`color:${card.color}`">
            Shift {{ card.label }}
          </p>
          <h2 class="text-5xl sm:text-6xl font-black tabular-nums leading-none"
            :style="`color:${card.color}`">
            {{ weekTotal(card.key) }}
          </h2>
          <p class="mt-2 text-[10px] font-black uppercase tracking-widest opacity-60"
            :style="`color:${card.color}`">Total minggu ini</p>
        </div>
      </div>

      <!-- ── TOOLBAR ── -->
      <div class="d-card">
        <div class="flex flex-wrap items-center gap-3">

          <!-- Navigasi minggu -->
          <div class="flex items-center gap-1">
            <button @click="prevWeek" class="nav-btn">
              <ChevronLeft :size="16" />
            </button>
            <button @click="goToday" class="nav-btn-center">
              <Calendar :size="13" />
              <span>Minggu Ini</span>
            </button>
            <button @click="nextWeek" class="nav-btn">
              <ChevronRight :size="16" />
            </button>
          </div>

          <!-- Label rentang minggu -->
          <div class="px-3 py-2 rounded-xl bg-slate-100 border-2 border-slate-200">
            <p class="text-xs font-black text-slate-600 tabular-nums">{{ weekLabel }}</p>
          </div>

          <div class="flex-1" />

          <!-- Filter Divisi -->
          <select v-model="filterDivisi" class="filter-select">
            <option value="">Semua Divisi</option>
            <option v-for="d in DIVISI_LIST" :key="d" :value="d">{{ d }}</option>
          </select>

          <!-- Search pegawai -->
          <div class="search-box">
            <input v-model="filterSearch" type="text"
              placeholder="Cari pegawai..."
              class="search-input" />
            <button v-if="filterSearch" @click="filterSearch=''"
              class="search-clear"><X :size="12" /></button>
          </div>

          <!-- Refresh -->
          <button @click="fetchJadwal" class="tool-btn tool-btn-ghost">
            <RefreshCw :size="14" :class="loading ? 'animate-spin' : ''" />
            Refresh
          </button>

          <!-- Edit / Simpan -->
          <button v-if="!editMode" @click="editMode = true"
            class="tool-btn tool-btn-blue">
            <Pencil :size="14" />
            Edit Jadwal
          </button>
          <template v-else>
            <button @click="editMode = false" class="tool-btn tool-btn-ghost">
              <X :size="14" />
              Batal
            </button>
            <button @click="saveJadwal" class="tool-btn tool-btn-green"
              :disabled="saveLoading">
              <Loader2 v-if="saveLoading" :size="14" class="animate-spin" />
              <Save v-else :size="14" />
              {{ saveLoading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </template>
        </div>

        <!-- Edit mode banner -->
        <div v-if="editMode"
          class="mt-3 pt-3 border-t-2 border-amber-100 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p class="text-xs font-black text-amber-600 tracking-wide uppercase">
            Mode edit aktif — klik shift untuk mengubah
          </p>
        </div>
      </div>

      <!-- ── TABEL JADWAL ── -->
      <div class="d-card overflow-hidden p-0">

        <!-- Header tabel -->
        <div class="px-5 sm:px-7 py-4 border-b-2 border-slate-100 flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Jadwal</p>
            <h3 class="text-base font-black text-slate-800">
              {{ filteredList.length }} Pegawai
              <span v-if="filterDivisi" class="text-sky-600">· {{ filterDivisi }}</span>
            </h3>
          </div>
          <Loader2 v-if="loading" :size="16" class="text-sky-400 animate-spin" />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full" style="min-width: 860px">
            <thead>
              <tr class="bg-slate-50 border-b-2 border-slate-100">
                <!-- Kolom pegawai -->
                <th class="d-th pl-6 w-[200px] sticky left-0 bg-slate-50 z-10">Pegawai</th>

                <!-- Kolom hari -->
                <th
                  v-for="day in days" :key="day.tanggal"
                  class="d-th text-center"
                  :class="day.isToday ? 'text-sky-600' : ''"
                >
                  <div class="flex flex-col items-center gap-0.5">
                    <span>{{ day.label }}</span>
                    <span
                      class="text-[10px] tabular-nums font-black px-1.5 py-0.5 rounded-md"
                      :class="day.isToday
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-400 font-bold'"
                    >
                      {{ day.tanggal.slice(8) }}
                    </span>
                  </div>
                </th>
              </tr>

              <!-- Summary row: jumlah per shift per hari -->
              <tr class="border-b-2 border-slate-100 bg-white">
                <td class="px-6 py-2 sticky left-0 bg-white z-10">
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Jumlah / Hari
                  </span>
                </td>
                <td v-for="(s, i) in summary" :key="i" class="py-2 px-2">
                  <div class="flex flex-col gap-0.5 items-center">
                    <span class="sum-pill sum-pagi">{{ s.pagi }}P</span>
                    <span class="sum-pill sum-siang">{{ s.siang }}S</span>
                    <span class="sum-pill sum-malam">{{ s.malam }}M</span>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(pegawai, ri) in filteredList" :key="pegawai.id"
                class="shift-row border-b border-slate-100"
                :style="`animation-delay:${Math.min(ri,12)*35}ms`"
              >
                <!-- Nama pegawai -->
                <td class="d-td pl-6 sticky left-0 bg-white z-10 border-r-2 border-slate-100">
                  <div class="flex items-center gap-2.5">
                    <div class="avatar-box">{{ pegawai.nama.charAt(0) }}</div>
                    <div>
                      <p class="font-black text-sm text-slate-800 whitespace-nowrap">{{ pegawai.nama }}</p>
                      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ pegawai.divisi }}</p>
                    </div>
                  </div>
                </td>

                <!-- Sel shift per hari -->
                <td
                  v-for="jadwal in pegawai.jadwal" :key="jadwal.tanggal"
                  class="d-td text-center"
                >
                  <!-- VIEW MODE -->
                  <div v-if="!editMode">
                    <span
                      class="shift-badge"
                      :style="`
                        background:${SHIFT_THEME[jadwal.shift]?.bg};
                        border-color:${SHIFT_THEME[jadwal.shift]?.border};
                        color:${SHIFT_THEME[jadwal.shift]?.text};
                      `"
                    >
                      {{ jadwal.shift }}
                    </span>
                  </div>

                  <!-- EDIT MODE: dropdown -->
                  <div v-else>
                    <select
                      :value="jadwal.shift"
                      @change="setShift(pegawai.id, jadwal.tanggal, $event.target.value)"
                      class="shift-select"
                      :style="`
                        background:${SHIFT_THEME[jadwal.shift]?.bg};
                        border-color:${SHIFT_THEME[jadwal.shift]?.border};
                        color:${SHIFT_THEME[jadwal.shift]?.text};
                      `"
                    >
                      <option v-for="s in SHIFT_DEF" :key="s.nama" :value="s.nama">
                        {{ s.nama }}
                      </option>
                    </select>
                  </div>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-if="!filteredList.length && !loading">
                <td :colspan="1 + days.length" class="py-14 text-center">
                  <p class="font-black text-slate-400 text-sm tracking-wide">
                    Tidak ada pegawai ditemukan
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── LEGEND ── -->
      <div class="d-card">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Keterangan Shift</p>
        <div class="flex flex-wrap gap-3">
          <div v-for="s in SHIFT_DEF" :key="s.nama"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border-2"
            :style="`background:${SHIFT_THEME[s.nama]?.bg}; border-color:${SHIFT_THEME[s.nama]?.border}`">
            <component :is="SHIFT_THEME[s.nama]?.icon" :size="14"
              :style="`color:${SHIFT_THEME[s.nama]?.text}`" />
            <div>
              <p class="text-xs font-black" :style="`color:${SHIFT_THEME[s.nama]?.text}`">
                {{ s.nama }}
              </p>
              <p class="text-[10px] font-bold" :style="`color:${SHIFT_THEME[s.nama]?.text};opacity:0.7`">
                {{ s.jam }}
              </p>
            </div>
          </div>
        </div>
      </div>

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
.sum-card {
  animation: cardPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.sum-card:hover {
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
  background: #fff;
  border: 2.5px solid #e2e8f0;
  border-radius: 24px;
  padding: 20px 22px;
  transition: box-shadow 0.2s;
}
.d-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.05); }
@media(min-width:640px){ .d-card{ padding:24px 28px; } }

/* ══════════════════════════════════════════════════════
   NAV BUTTONS
══════════════════════════════════════════════════════ */
.nav-btn {
  width:34px; height:34px;
  border-radius:10px;
  border:2.5px solid #e2e8f0;
  background:#f8fafc;
  display:flex; align-items:center; justify-content:center;
  color:#475569;
  cursor:pointer;
  transition:all 0.15s;
}
.nav-btn:hover { background:#f1f5f9; border-color:#bae6fd; color:#0284c7; transform:scale(1.05); }
.nav-btn:active { transform:scale(0.94); }

.nav-btn-center {
  display:flex; align-items:center; gap:5px;
  padding:7px 12px;
  border-radius:10px;
  border:2.5px solid #e2e8f0;
  background:#f8fafc;
  font-size:12px; font-weight:900; color:#475569;
  cursor:pointer;
  transition:all 0.15s;
}
.nav-btn-center:hover { background:#eff6ff; border-color:#bfdbfe; color:#2563eb; }

/* ══════════════════════════════════════════════════════
   FILTER & SEARCH
══════════════════════════════════════════════════════ */
.filter-select {
  padding:8px 12px;
  border:2.5px solid #e2e8f0;
  border-radius:12px;
  font-size:12px; font-weight:800; color:#334155;
  background:#f8fafc;
  outline:none; cursor:pointer;
  transition:border-color 0.15s;
}
.filter-select:focus { border-color:#7dd3fc; }

.search-box { position:relative; }
.search-input {
  padding:8px 30px 8px 12px;
  border:2.5px solid #e2e8f0;
  border-radius:12px;
  font-size:12px; font-weight:700; color:#0f172a;
  background:#f8fafc; outline:none;
  transition:border-color 0.15s;
  width:160px;
}
.search-input::placeholder { color:#cbd5e1; }
.search-input:focus { border-color:#7dd3fc; background:#fff; }
.search-clear {
  position:absolute; right:8px; top:50%; transform:translateY(-50%);
  color:#94a3b8; transition:color 0.15s;
}
.search-clear:hover { color:#ef4444; }

/* ══════════════════════════════════════════════════════
   TOOL BUTTONS
══════════════════════════════════════════════════════ */
.tool-btn {
  display:flex; align-items:center; gap:6px;
  padding:8px 14px;
  border-radius:12px;
  font-size:12px; font-weight:900;
  border:2px solid transparent;
  cursor:pointer;
  transition:all 0.18s;
  white-space:nowrap;
}
.tool-btn:hover   { transform:translateY(-1px); }
.tool-btn:active  { transform:scale(0.96); }
.tool-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

.tool-btn-ghost { background:#f8fafc; border-color:#e2e8f0; color:#475569; }
.tool-btn-ghost:hover { background:#f1f5f9; border-color:#cbd5e1; }

.tool-btn-blue { background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
.tool-btn-blue:hover { background:#dbeafe; border-color:#93c5fd; }

.tool-btn-green { background:#dcfce7; border-color:#86efac; color:#15803d; }
.tool-btn-green:hover { background:#bbf7d0; border-color:#4ade80; }

/* ══════════════════════════════════════════════════════
   TABLE
══════════════════════════════════════════════════════ */
.d-th {
  padding:12px 8px;
  font-size:10px; font-weight:900;
  color:#94a3b8;
  text-transform:uppercase; letter-spacing:0.1em;
  text-align:left; white-space:nowrap;
}
.d-td { padding:10px 8px; vertical-align:middle; }

/* ══════════════════════════════════════════════════════
   SHIFT ROW
══════════════════════════════════════════════════════ */
.shift-row {
  animation: rowIn 0.28s ease both;
  transition: background 0.12s;
}
.shift-row:hover { background:#f8fafc; }
@keyframes rowIn {
  from { opacity:0; transform:translateY(5px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ══════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════ */
.avatar-box {
  width:34px; height:34px;
  border-radius:10px;
  background:linear-gradient(135deg,#e0f2fe,#dbeafe);
  border:2px solid #bae6fd;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:900; color:#0369a1;
  flex-shrink:0;
}

/* ══════════════════════════════════════════════════════
   SHIFT BADGE
══════════════════════════════════════════════════════ */
.shift-badge {
  display:inline-flex; align-items:center;
  padding:4px 10px;
  border-radius:9px;
  font-size:11px; font-weight:900;
  border:2px solid;
  letter-spacing:0.02em;
  white-space:nowrap;
}

/* ══════════════════════════════════════════════════════
   SHIFT SELECT (edit mode)
══════════════════════════════════════════════════════ */
.shift-select {
  padding:4px 6px;
  border-radius:9px;
  font-size:11px; font-weight:900;
  border:2px solid;
  outline:none; cursor:pointer;
  transition:all 0.15s;
  width:76px;
}
.shift-select:focus { box-shadow:0 0 0 3px rgba(14,165,233,0.2); }

/* ══════════════════════════════════════════════════════
   SUMMARY PILLS (di bawah header kolom hari)
══════════════════════════════════════════════════════ */
.sum-pill {
  display:inline-flex; align-items:center; justify-content:center;
  padding:1px 5px;
  border-radius:5px;
  font-size:10px; font-weight:900;
  border:1.5px solid;
  min-width:26px;
}
.sum-pagi  { background:#fef9c3; border-color:#fde047; color:#a16207; }
.sum-siang { background:#e0f2fe; border-color:#7dd3fc; color:#0369a1; }
.sum-malam { background:#ede9fe; border-color:#c4b5fd; color:#6d28d9; }

/* ══════════════════════════════════════════════════════
   SCROLLBAR
══════════════════════════════════════════════════════ */
::-webkit-scrollbar { height:4px; width:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
</style>