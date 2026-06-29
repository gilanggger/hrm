<script setup>
/**
 * ============================================================
 *  FILE: src/views/LogLembur.vue
 *
 *  ✅ BACKEND: Tidak perlu menyentuh file ini.
 *             Ubah data lewat endpoint API saja.
 *
 *  ✅ FRONTEND: Semua logic ada di useLogLembur composable.
 *              Hanya ubah tampilan (HTML/CSS) di sini.
 * ============================================================
 */

import { ref, computed } from 'vue'
import {
  Clock3, ChevronLeft, ChevronRight, Plus, Check, X,
  Search, ChevronDown, TimerReset, Wallet, ClipboardCheck,
  AlertCircle, CalendarDays, RefreshCw, Loader2, Download,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import { useLogLembur, JENIS_LEMBUR_DEF } from '@/composables/useLogLembur'

const {
  loading, error, submitLoading, actionLoading,
  monthLabel,
  sortedList, summary, rekapPegawai,
  filterStatus, filterJenisHari, filterDivisi, filterSearch,
  DIVISI_LIST, STATUS_DEF, RATE_PER_JAM,
  prevMonth, nextMonth, goCurrentMonth,
  fetchLogLembur, ajukanLembur, setujuiLembur, tolakLembur,
  hitungEstimasi,
} = useLogLembur()

/* ══ Daftar pegawai (statis — backend kirim via /api/pegawai) ══ */
const PEGAWAI_LIST = [
  { id:1,  nama:'Andi Saputra' },   { id:2,  nama:'Budi Santoso' },
  { id:3,  nama:'Rudi Hartono' },   { id:4,  nama:'Fajar Nugroho' },
  { id:5,  nama:'Joko Widodo' },    { id:6,  nama:'Siti Aminah' },
  { id:7,  nama:'Dewi Rahayu' },    { id:8,  nama:'Hendra Kusuma' },
  { id:9,  nama:'Wahyu Pratama' },  { id:10, nama:'Rizki Firmansyah' },
  { id:11, nama:'Agus Salim' },     { id:12, nama:'Nurul Hidayah' },
]

/* ══ Modal Form Catat Lembur ══ */
const showForm = ref(false)
const form = ref({
  pegawaiId: '', tanggal: '',
  jamMulai: '17:00', jamSelesai: '20:00',
  jenisHari: JENIS_LEMBUR_DEF[0].nama, alasan: '',
})

const estimasi = computed(() =>
  hitungEstimasi(form.value.jamMulai, form.value.jamSelesai, form.value.jenisHari)
)

const resetForm = () => {
  form.value = { pegawaiId: '', tanggal: '', jamMulai: '17:00', jamSelesai: '20:00', jenisHari: JENIS_LEMBUR_DEF[0].nama, alasan: '' }
  showForm.value = false
}

const submitForm = async () => {
  if (!form.value.pegawaiId || !form.value.tanggal || !form.value.alasan.trim()) {
    alert('Pegawai, tanggal, dan alasan wajib diisi.')
    return
  }
  await ajukanLembur({ ...form.value, pegawaiId: Number(form.value.pegawaiId) })
  resetForm()
}

/* ══ Modal Tolak ══ */
const showTolakModal = ref(null)
const alasanTolak    = ref('')
const openTolak      = (id) => { showTolakModal.value = id; alasanTolak.value = '' }
const confirmTolak   = async () => {
  if (!alasanTolak.value.trim()) { alert('Alasan penolakan wajib diisi.'); return }
  await tolakLembur(showTolakModal.value, alasanTolak.value)
  showTolakModal.value = null
}

/* ══ Summary cards config ══ */
const summaryCards = computed(() => {
  if (!summary.value) return []
  return [
    { label: 'Menunggu',  value: summary.value.menunggu,               icon: ClipboardCheck, bg: '#fef9c3', border: '#fde047', color: '#a16207' },
    { label: 'Disetujui', value: summary.value.disetujui,              icon: Check,          bg: '#dcfce7', border: '#86efac', color: '#15803d' },
    { label: 'Ditolak',   value: summary.value.ditolak,                icon: X,              bg: '#fee2e2', border: '#fca5a5', color: '#b91c1c' },
    { label: 'Total Jam', value: `${summary.value.totalJamDisetujui}j`,icon: TimerReset,     bg: '#e0f2fe', border: '#7dd3fc', color: '#0369a1' },
  ]
})

/* ══ Helpers ══ */
const rupiahFormat = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const statusTheme = {
  'Menunggu':  { bg: '#fef9c3', border: '#fde047', text: '#a16207' },
  'Disetujui': { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
  'Ditolak':   { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c' },
}

const jenisTheme = {
  'Hari Kerja':                 { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1' },
  'Hari Libur / Tanggal Merah': { bg: '#ede9fe', border: '#c4b5fd', text: '#6d28d9' },
}

const limitPct   = (jam, limit) => Math.min(Math.round((jam / limit) * 100), 100)
const limitColor = (pct) => {
  if (pct >= 90) return { bg:'#fee2e2', border:'#fca5a5', fill:'#ef4444' }
  if (pct >= 70) return { bg:'#fef9c3', border:'#fde047', fill:'#f59e0b' }
  return { bg:'#e0f2fe', border:'#7dd3fc', fill:'#0ea5e9' }
}

const hasFilter = computed(() =>
  filterStatus.value || filterJenisHari.value || filterDivisi.value || filterSearch.value
)
</script>

<template>
  <AppLayout breadcrumb="Manajemen Absensi / Log Lembur" title="Log Lembur">

    <!-- Badge pending -->
    <template #badge>
      <span
        v-if="summary && summary.menunggu > 0"
        class="px-2.5 py-0.5 rounded-full text-xs font-black animate-pulse"
        style="background:#fef9c3; border:2px solid #fde047; color:#a16207"
      >
        {{ summary.menunggu }} Menunggu
      </span>
    </template>

    <template #default>

      <!-- ══ MODAL TOLAK ══════════════════════════════════════ -->
      <transition name="fade">
        <div
          v-if="showTolakModal"
          class="fixed inset-0 z-50 flex items-center justify-center px-4"
          style="background:rgba(15,23,42,0.35); backdrop-filter:blur(6px)"
          @click.self="showTolakModal = null"
        >
          <div class="modal-box w-full max-w-md">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="modal-title">Tolak Pengajuan Lembur</h3>
                <p class="modal-sub">Tulis alasan agar pegawai dapat mengetahui.</p>
              </div>
              <button @click="showTolakModal = null" class="modal-close-btn">
                <X :size="15" />
              </button>
            </div>
            <textarea
              v-model="alasanTolak" rows="3"
              placeholder="Contoh: Jam lembur tidak sesuai jadwal mesin..."
              class="modal-textarea"
            />
            <div class="flex gap-3 mt-4">
              <button @click="showTolakModal = null" class="modal-btn-ghost flex-1">Batal</button>
              <button
                @click="confirmTolak" :disabled="actionLoading"
                class="modal-btn-danger flex-1"
              >
                <Loader2 v-if="actionLoading" :size="14" class="animate-spin" />
                <span v-else>Konfirmasi Tolak</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ══ MODAL FORM CATAT LEMBUR ════════════════════════ -->
      <transition name="fade">
        <div
          v-if="showForm"
          class="fixed inset-0 z-50 flex items-center justify-center px-4"
          style="background:rgba(15,23,42,0.35); backdrop-filter:blur(6px)"
          @click.self="resetForm"
        >
          <div class="modal-box w-full max-w-lg">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 class="modal-title">Catat Lembur Baru</h3>
                <p class="modal-sub">Isi data pengajuan lembur pegawai</p>
              </div>
              <button @click="resetForm" class="modal-close-btn"><X :size="15" /></button>
            </div>

            <div class="space-y-4">

              <!-- Pegawai -->
              <div>
                <label class="form-label">Pegawai</label>
                <div class="relative">
                  <select v-model="form.pegawaiId" class="form-select pr-9">
                    <option value="" disabled>-- Pilih Pegawai --</option>
                    <option v-for="p in PEGAWAI_LIST" :key="p.id" :value="p.id">{{ p.nama }}</option>
                  </select>
                  <ChevronDown :size="14" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <!-- Tanggal + Jenis -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="form-label">Tanggal</label>
                  <input type="date" v-model="form.tanggal" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Jenis Hari</label>
                  <div class="relative">
                    <select v-model="form.jenisHari" class="form-select pr-9">
                      <option v-for="j in JENIS_LEMBUR_DEF" :key="j.nama" :value="j.nama">{{ j.nama }}</option>
                    </select>
                    <ChevronDown :size="14" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <!-- Jam Mulai + Jam Selesai -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="form-label">Jam Mulai</label>
                  <input type="time" v-model="form.jamMulai" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Jam Selesai</label>
                  <input type="time" v-model="form.jamSelesai" class="form-input" />
                </div>
              </div>

              <!-- Estimasi otomatis -->
              <div v-if="estimasi.durasiJam > 0" class="estimasi-box">
                <div class="flex items-center gap-2">
                  <TimerReset :size="15" style="color:#0369a1" />
                  <span class="font-black text-sm" style="color:#0369a1">{{ estimasi.durasiJam }} jam</span>
                </div>
                <div class="flex items-center gap-2">
                  <Wallet :size="15" style="color:#15803d" />
                  <span class="font-black text-sm" style="color:#15803d">{{ rupiahFormat(estimasi.estimasiUpah) }}</span>
                </div>
              </div>

              <!-- Alasan -->
              <div>
                <label class="form-label">Alasan Lembur</label>
                <textarea
                  v-model="form.alasan" rows="3"
                  placeholder="Tuliskan alasan pengajuan lembur..."
                  class="modal-textarea"
                />
              </div>
            </div>

            <div class="flex gap-3 mt-5">
              <button @click="resetForm" class="modal-btn-ghost flex-1">Batal</button>
              <button
                @click="submitForm" :disabled="submitLoading"
                class="modal-btn-primary flex-1"
              >
                <Loader2 v-if="submitLoading" :size="14" class="animate-spin" />
                <span v-else>Simpan Lembur</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ══ KONTEN HALAMAN ══════════════════════════════════ -->

      <!-- LOADING -->
      <div v-if="loading && !sortedList.length" class="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <Loader2 :size="48" class="animate-spin" style="color:#0ea5e9" />
        <p class="font-black text-sm tracking-widest uppercase" style="color:#64748b">Memuat data...</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="error && !sortedList.length" class="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div class="w-16 h-16 rounded-3xl flex items-center justify-center" style="background:#fee2e2; border:2.5px solid #fca5a5">
          <AlertCircle :size="32" style="color:#b91c1c" />
        </div>
        <p class="font-black text-lg text-slate-800">{{ error }}</p>
        <button @click="fetchLogLembur" class="tool-btn tool-btn-primary">
          <RefreshCw :size="15" /> Coba Lagi
        </button>
      </div>

      <div v-else class="space-y-5 pb-8 page-enter">

        <!-- ── Navigasi Bulan + Tombol Catat ── -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button @click="prevMonth" class="page-btn"><ChevronLeft :size="15" /></button>
            <button
              @click="goCurrentMonth"
              class="month-label-btn"
            >{{ monthLabel }}</button>
            <button @click="nextMonth" class="page-btn"><ChevronRight :size="15" /></button>
          </div>
          <button @click="showForm = true" class="tool-btn tool-btn-primary">
            <Plus :size="15" /> Catat Lembur
          </button>
        </div>

        <!-- ── Summary Cards ── -->
        <div v-if="summary" class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="(c, i) in summaryCards" :key="i"
            class="summary-card relative overflow-hidden cursor-default"
            :style="`background:${c.bg}; border:2.5px solid ${c.border}; animation-delay:${i*70}ms`"
          >
            <div class="absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center" :style="`background:${c.border}`">
              <component :is="c.icon" :size="20" :style="`color:${c.color}`" />
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest mb-2" :style="`color:${c.color}`">{{ c.label }}</p>
            <h2 class="text-5xl sm:text-6xl font-black tabular-nums leading-none" :style="`color:${c.color}`">
              {{ c.value }}
            </h2>
          </div>
        </div>

        <!-- ── Main Grid ── -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">

          <!-- Log Lembur (kiri 2/3) -->
          <div class="xl:col-span-2 d-card overflow-hidden p-0">

            <!-- Header + Filter -->
            <div class="px-5 sm:px-7 py-4 border-b-2 border-slate-100">
              <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Data</p>
                  <h3 class="text-base font-black text-slate-800">Log Lembur</h3>
                </div>
                <div class="flex items-center gap-2">
                  <Loader2 v-if="loading" :size="15" class="animate-spin text-sky-400" />
                  <span class="text-xs font-black text-slate-400 tabular-nums">{{ sortedList.length }} pengajuan</span>
                </div>
              </div>

              <!-- Filter row -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- Search -->
                <div class="search-box flex-1 min-w-[160px]">
                  <Search :size="14" class="search-icon" />
                  <input v-model="filterSearch" type="text" placeholder="Cari nama..." class="search-input" />
                  <button v-if="filterSearch" @click="filterSearch = ''" class="search-clear"><X :size="12" /></button>
                </div>

                <!-- Filter Status -->
                <select v-model="filterStatus" class="filter-select">
                  <option value="">Semua Status</option>
                  <option v-for="s in STATUS_DEF" :key="s.nama" :value="s.nama">{{ s.nama }}</option>
                </select>

                <!-- Filter Jenis -->
                <select v-model="filterJenisHari" class="filter-select">
                  <option value="">Semua Jenis</option>
                  <option v-for="j in JENIS_LEMBUR_DEF" :key="j.nama" :value="j.nama">{{ j.nama === 'Hari Libur / Tanggal Merah' ? 'Hari Libur' : j.nama }}</option>
                </select>

                <!-- Filter Divisi -->
                <select v-model="filterDivisi" class="filter-select">
                  <option value="">Semua Divisi</option>
                  <option v-for="d in DIVISI_LIST" :key="d" :value="d">{{ d }}</option>
                </select>

                <!-- Reset -->
                <button v-if="hasFilter" @click="filterStatus=''; filterJenisHari=''; filterDivisi=''; filterSearch=''" class="tool-btn tool-btn-ghost">
                  <X :size="13" /> Reset
                </button>
              </div>
            </div>

            <!-- List rows -->
            <div class="divide-y-2 divide-slate-100">
              <div
                v-for="(item, i) in sortedList" :key="item.id"
                class="log-row px-5 sm:px-7 py-4"
                :style="`animation-delay:${Math.min(i,12)*40}ms`"
              >
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                  <!-- Kiri: info -->
                  <div class="flex items-start gap-3 min-w-0 flex-1">
                    <!-- Avatar -->
                    <div class="avatar-box shrink-0 mt-0.5">{{ item.nama.charAt(0) }}</div>

                    <div class="min-w-0 flex-1">
                      <!-- Baris 1 -->
                      <div class="flex flex-wrap items-center gap-2 mb-1.5">
                        <h4 class="font-black text-sm text-slate-800">{{ item.nama }}</h4>
                        <span class="text-xs font-black text-slate-400">{{ item.divisi }}</span>
                        <!-- Jenis badge -->
                        <span
                          class="jenis-badge"
                          :style="jenisTheme[item.jenisHari]
                            ? `background:${jenisTheme[item.jenisHari].bg};border-color:${jenisTheme[item.jenisHari].border};color:${jenisTheme[item.jenisHari].text}`
                            : ''"
                        >
                          {{ item.jenisHari === 'Hari Libur / Tanggal Merah' ? 'Hari Libur' : 'Hari Kerja' }}
                        </span>
                      </div>

                      <!-- Alasan -->
                      <p class="text-xs font-bold text-slate-500 mb-2 italic">{{ item.alasan }}</p>

                      <!-- Meta -->
                      <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span class="meta-item">
                          <CalendarDays :size="11" />
                          {{ item.tanggal }}
                        </span>
                        <span class="meta-item">
                          <Clock3 :size="11" />
                          {{ item.jamMulai }} – {{ item.jamSelesai }}
                        </span>
                        <span class="meta-item font-black text-slate-700">
                          <TimerReset :size="11" />
                          {{ item.durasiJam }} jam
                        </span>
                        <span class="meta-item font-black" style="color:#15803d">
                          <Wallet :size="11" />
                          {{ rupiahFormat(item.estimasiUpah) }}
                        </span>
                      </div>

                      <!-- Catatan / disetujui oleh -->
                      <p v-if="item.catatan" class="mt-1.5 text-[11px] font-bold text-slate-400 italic">
                        Catatan: {{ item.catatan }}
                      </p>
                      <p v-if="item.disetujuiOleh" class="mt-1 text-[11px] font-black" style="color:#15803d">
                        ✓ Disetujui oleh {{ item.disetujuiOleh }}
                      </p>
                    </div>
                  </div>

                  <!-- Kanan: status + aksi -->
                  <div class="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <span
                      class="status-badge"
                      :style="statusTheme[item.status]
                        ? `background:${statusTheme[item.status].bg};border-color:${statusTheme[item.status].border};color:${statusTheme[item.status].text}`
                        : ''"
                    >{{ item.status }}</span>

                    <div v-if="item.status === 'Menunggu'" class="flex items-center gap-1.5">
                      <button
                        @click="setujuiLembur(item.id)"
                        :disabled="actionLoading"
                        class="action-btn action-approve"
                      >
                        <Check :size="12" /> Setujui
                      </button>
                      <button
                        @click="openTolak(item.id)"
                        :disabled="actionLoading"
                        class="action-btn action-reject"
                      >
                        <X :size="12" /> Tolak
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Empty state -->
              <div v-if="sortedList.length === 0 && !loading" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#f1f5f9; border:2.5px solid #e2e8f0">
                    <Clock3 :size="24" style="color:#94a3b8" />
                  </div>
                  <p class="font-black text-slate-400 text-sm tracking-wide">Tidak ada log lembur</p>
                  <p class="text-xs font-bold text-slate-300">Coba ubah filter atau catat lembur baru.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Rekap Jam Pegawai (kanan 1/3) -->
          <div class="space-y-4">

            <!-- Rekap per pegawai -->
            <div class="d-card p-0 overflow-hidden">
              <div class="px-5 py-4 border-b-2 border-slate-100">
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Rekap Bulanan</p>
                <h3 class="text-base font-black text-slate-800">Jam Lembur Pegawai</h3>
              </div>
              <div class="divide-y-2 divide-slate-100">
                <div
                  v-for="(item, i) in rekapPegawai.filter(r => r.totalJam > 0)" :key="item.pegawaiId"
                  class="rekap-row px-5 py-3.5"
                  :style="`animation-delay:${i*50}ms`"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="avatar-box shrink-0 !w-8 !h-8 !text-xs">{{ item.nama.charAt(0) }}</div>
                      <div class="min-w-0">
                        <p class="text-sm font-black text-slate-800 leading-tight truncate">{{ item.nama }}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ item.divisi }}</p>
                      </div>
                    </div>
                    <div class="text-right shrink-0 ml-2">
                      <span class="text-sm font-black text-slate-800 tabular-nums">{{ item.totalJam }}j</span>
                      <span class="text-xs font-bold text-slate-400"> / {{ item.limit }}j</span>
                    </div>
                  </div>

                  <!-- Progress bar -->
                  <div class="h-2.5 rounded-full overflow-hidden" :style="`background:${limitColor(limitPct(item.totalJam, item.limit)).bg}; border:2px solid ${limitColor(limitPct(item.totalJam, item.limit)).border}`">
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      :style="`width:${limitPct(item.totalJam, item.limit)}%; background:${limitColor(limitPct(item.totalJam, item.limit)).fill}`"
                    />
                  </div>

                  <p v-if="limitPct(item.totalJam, item.limit) >= 90"
                    class="text-[10px] font-black mt-1 flex items-center gap-1" style="color:#b91c1c">
                    <AlertCircle :size="10" /> Mendekati batas jam lembur
                  </p>
                </div>

                <div v-if="rekapPegawai.filter(r => r.totalJam > 0).length === 0" class="py-8 text-center">
                  <p class="text-xs font-black text-slate-300">Belum ada jam lembur disetujui</p>
                </div>
              </div>
            </div>

            <!-- Total upah -->
            <div v-if="summary" class="d-card" style="background:#e0f2fe; border-color:#7dd3fc">
              <p class="text-[10px] font-black uppercase tracking-widest mb-2" style="color:#0369a1">Total Upah Lembur</p>
              <h2 class="text-3xl font-black tabular-nums leading-tight" style="color:#0c4a6e">
                {{ rupiahFormat(summary.totalUpahDisetujui) }}
              </h2>
              <p class="text-[11px] font-bold mt-2" style="color:#0369a1; opacity:.75">
                {{ summary.disetujui }} pengajuan disetujui bulan ini
              </p>
              <div class="flex items-center gap-1.5 mt-3 pt-3" style="border-top:2px solid #7dd3fc">
                <div class="w-1.5 h-1.5 rounded-full animate-pulse" style="background:#10b981" />
                <span class="text-[10px] font-black uppercase tracking-wider" style="color:#0369a1">
                  Tarif Rp{{ RATE_PER_JAM.toLocaleString('id-ID') }}/jam dasar
                </span>
              </div>
            </div>

          </div>
        </div>

        <div class="h-4" />
      </div>

    </template>
  </AppLayout>
</template>

<style scoped>

/* ══ PAGE ENTER ══ */
.page-enter {
  animation: pageIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes pageIn {
  from { opacity:0; transform:translateY(14px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ══ SUMMARY CARDS ══ */
.summary-card {
  border-radius: 24px;
  padding: 20px;
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

/* ══ CARD BASE ══ */
.d-card {
  background: #ffffff;
  border: 2.5px solid #e2e8f0;
  border-radius: 24px;
  padding: 20px 22px;
  transition: box-shadow 0.2s;
}
.d-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.05); }
@media (min-width:640px) { .d-card { padding: 24px 28px; } }

/* ══ SEARCH ══ */
.search-box { position:relative; display:flex; align-items:center; }
.search-icon { position:absolute; left:11px; color:#94a3b8; pointer-events:none; }
.search-input {
  width:100%; padding:8px 32px 8px 33px;
  border:2.5px solid #e2e8f0; border-radius:12px;
  font-size:12px; font-weight:800; color:#0f172a; background:#f8fafc; outline:none;
  transition:border-color .15s, background .15s;
}
.search-input::placeholder { color:#cbd5e1; font-weight:700; }
.search-input:focus { border-color:#7dd3fc; background:#fff; }
.search-clear { position:absolute; right:9px; color:#94a3b8; padding:2px; border-radius:6px; transition:color .15s; }
.search-clear:hover { color:#ef4444; }

/* ══ FILTER SELECT ══ */
.filter-select {
  padding:8px 12px;
  border:2.5px solid #e2e8f0; border-radius:12px;
  font-size:12px; font-weight:800; color:#334155; background:#f8fafc;
  outline:none; cursor:pointer; transition:border-color .15s;
}
.filter-select:focus { border-color:#7dd3fc; }

/* ══ TOOLBAR BUTTONS ══ */
.tool-btn {
  display:flex; align-items:center; gap:6px;
  padding:8px 14px; border-radius:12px;
  font-size:12px; font-weight:900;
  border:2px solid transparent; cursor:pointer;
  transition:all .18s; white-space:nowrap;
}
.tool-btn:hover { transform:translateY(-1px); }
.tool-btn:active { transform:scale(0.96); }
.tool-btn-ghost { background:#f8fafc; border-color:#e2e8f0; color:#475569; }
.tool-btn-ghost:hover { background:#f1f5f9; border-color:#cbd5e1; }
.tool-btn-primary { background:#0ea5e9; border-color:#38bdf8; color:#fff; box-shadow:0 2px 10px rgba(14,165,233,.25); }
.tool-btn-primary:hover { background:#0284c7; box-shadow:0 4px 16px rgba(14,165,233,.35); }

/* ══ MONTH NAV ══ */
.month-label-btn {
  padding:8px 20px; border-radius:12px;
  border:2.5px solid #e2e8f0; background:#f8fafc;
  font-size:13px; font-weight:900; color:#334155;
  min-width:150px; text-align:center;
  cursor:pointer; transition:all .15s;
}
.month-label-btn:hover { border-color:#7dd3fc; background:#fff; }

/* ══ LOG ROW ══ */
.log-row {
  animation: rowIn 0.28s ease both;
  transition: background 0.12s;
}
.log-row:hover { background:#f8fafc; }
@keyframes rowIn {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ══ REKAP ROW ══ */
.rekap-row {
  animation: rowIn 0.28s ease both;
  transition: background .12s;
}
.rekap-row:hover { background:#f8fafc; }

/* ══ AVATAR ══ */
.avatar-box {
  width:34px; height:34px; border-radius:10px;
  background:linear-gradient(135deg,#e0f2fe,#dbeafe);
  border:2px solid #bae6fd;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:900; color:#0369a1;
}

/* ══ META ITEM ══ */
.meta-item {
  display:inline-flex; align-items:center; gap:4px;
  font-size:11px; font-weight:700; color:#94a3b8;
}

/* ══ JENIS BADGE ══ */
.jenis-badge {
  display:inline-flex; align-items:center;
  padding:2px 9px; border-radius:8px;
  font-size:11px; font-weight:900;
  border:2px solid;
}

/* ══ STATUS BADGE ══ */
.status-badge {
  display:inline-flex; align-items:center;
  padding:4px 10px; border-radius:10px;
  font-size:11px; font-weight:900;
  border:2px solid; white-space:nowrap;
}

/* ══ ACTION BUTTONS ══ */
.action-btn {
  display:inline-flex; align-items:center; gap:4px;
  padding:5px 10px; border-radius:10px;
  font-size:11px; font-weight:900;
  border:2px solid; cursor:pointer;
  transition:all .15s;
}
.action-btn:hover { transform:translateY(-1px); }
.action-btn:active { transform:scale(0.95); }
.action-btn:disabled { opacity:.55; cursor:not-allowed; }
.action-approve { background:#dcfce7; border-color:#86efac; color:#15803d; }
.action-approve:hover { background:#bbf7d0; }
.action-reject  { background:#fee2e2; border-color:#fca5a5; color:#b91c1c; }
.action-reject:hover  { background:#fecaca; }

/* ══ PAGE PAGINATION ══ */
.page-btn {
  min-width:34px; height:34px; padding:0 8px;
  border-radius:10px; border:2.5px solid #e2e8f0;
  background:#f8fafc; font-size:12px; font-weight:900; color:#475569;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .15s;
}
.page-btn:hover { background:#f1f5f9; border-color:#bae6fd; color:#0284c7; }

/* ══ MODAL ══ */
.modal-box {
  background:#fff;
  border:2.5px solid #e2e8f0;
  border-radius:28px;
  padding:24px;
  box-shadow:0 24px 64px rgba(0,0,0,0.14);
}
.modal-title  { font-size:17px; font-weight:900; color:#0f172a; }
.modal-sub    { font-size:12px; font-weight:700; color:#94a3b8; margin-top:2px; }
.modal-close-btn {
  width:34px; height:34px; border-radius:10px;
  background:#f1f5f9; border:2px solid #e2e8f0;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:#64748b; transition:all .15s;
  flex-shrink:0;
}
.modal-close-btn:hover { background:#fee2e2; border-color:#fca5a5; color:#b91c1c; }

.modal-textarea {
  width:100%; border:2.5px solid #e2e8f0; border-radius:14px;
  background:#f8fafc; padding:12px; font-size:13px; font-weight:700;
  color:#0f172a; outline:none; resize:none; transition:border-color .15s;
}
.modal-textarea::placeholder { color:#cbd5e1; }
.modal-textarea:focus { border-color:#7dd3fc; background:#fff; }

.modal-btn-ghost {
  height:44px; border-radius:14px;
  border:2.5px solid #e2e8f0; background:#fff;
  font-size:13px; font-weight:900; color:#475569;
  cursor:pointer; transition:all .15s;
}
.modal-btn-ghost:hover { background:#f8fafc; border-color:#cbd5e1; }

.modal-btn-primary {
  height:44px; border-radius:14px;
  background:#0ea5e9; border:2.5px solid #38bdf8;
  font-size:13px; font-weight:900; color:#fff;
  cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;
  box-shadow:0 2px 10px rgba(14,165,233,.25); transition:all .15s;
}
.modal-btn-primary:hover { background:#0284c7; box-shadow:0 4px 16px rgba(14,165,233,.35); }
.modal-btn-primary:disabled { opacity:.6; cursor:not-allowed; }

.modal-btn-danger {
  height:44px; border-radius:14px;
  background:linear-gradient(135deg,#ef4444,#f43f5e);
  border:2.5px solid #fca5a5;
  font-size:13px; font-weight:900; color:#fff;
  cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;
  box-shadow:0 2px 10px rgba(239,68,68,.2); transition:all .15s;
}
.modal-btn-danger:hover { opacity:.9; }
.modal-btn-danger:disabled { opacity:.6; cursor:not-allowed; }

/* ══ FORM INPUTS ══ */
.form-label {
  display:block; font-size:10px; font-weight:900;
  text-transform:uppercase; letter-spacing:.08em;
  color:#94a3b8; margin-bottom:6px;
}
.form-input {
  width:100%; height:44px;
  border:2.5px solid #e2e8f0; border-radius:14px;
  background:#f8fafc; padding:0 14px;
  font-size:13px; font-weight:800; color:#0f172a; outline:none;
  transition:border-color .15s, background .15s;
}
.form-input:focus { border-color:#7dd3fc; background:#fff; }
.form-select {
  width:100%; height:44px;
  border:2.5px solid #e2e8f0; border-radius:14px;
  background:#f8fafc; padding:0 14px;
  font-size:13px; font-weight:800; color:#0f172a;
  outline:none; appearance:none; cursor:pointer;
  transition:border-color .15s;
}
.form-select:focus { border-color:#7dd3fc; background:#fff; }

/* ══ ESTIMASI BOX ══ */
.estimasi-box {
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 16px; border-radius:14px;
  background:#e0f2fe; border:2.5px solid #7dd3fc;
}

/* ══ FADE TRANSITION ══ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>