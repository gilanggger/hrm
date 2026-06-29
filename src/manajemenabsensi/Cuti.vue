<script setup>
/**
 * ============================================================
 *  FILE: src/manajemenabsensi/Cuti.vue
 *
 *  ✅ BACKEND: Tidak perlu menyentuh file ini.
 *             Ubah data lewat endpoint API saja.
 *
 *  ✅ FRONTEND: Semua logic ada di useCuti.js
 *              Hanya ubah tampilan (HTML/CSS) di sini.
 * ============================================================
 */

import { ref, computed } from 'vue'
import {
  RefreshCw, AlertCircle, Loader2, Plus, X, Send,
  Clock, CheckCircle2, XCircle, Ban,
  Plane, Stethoscope, Baby, Heart, FileText,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import { useCuti } from '@/composables/useCuti'

const {
  loading, error, submitLoading, actionLoading,
  sortedList, summary, sisaCutiList,
  filterStatus, filterJenis, filterDivisi, filterSearch,
  DIVISI_LIST, JENIS_CUTI_DEF, STATUS_DEF,
  fetchPengajuanCuti, ajukanCuti, setujuiPengajuan, tolakPengajuan,
  hitungEstimasiHari,
} = useCuti()

// ── Tema jenis cuti ──────────────────────────────────────────
const JENIS_THEME = {
  'Cuti Tahunan':     { bg:'#dcfce7', border:'#86efac', text:'#15803d', icon: Plane },
  'Cuti Sakit':       { bg:'#fee2e2', border:'#fca5a5', text:'#b91c1c', icon: Stethoscope },
  'Cuti Melahirkan':  { bg:'#fce7f3', border:'#f9a8d4', text:'#be185d', icon: Baby },
  'Cuti Menikah':     { bg:'#ede9fe', border:'#c4b5fd', text:'#6d28d9', icon: Heart },
  'Izin Lainnya':     { bg:'#f1f5f9', border:'#e2e8f0', text:'#475569', icon: FileText },
}

// ── Tema status ──────────────────────────────────────────────
const STATUS_THEME = {
  Menunggu:   { bg:'#fef9c3', border:'#fde047', text:'#a16207', icon: Clock },
  Disetujui:  { bg:'#dcfce7', border:'#86efac', text:'#15803d', icon: CheckCircle2 },
  Ditolak:    { bg:'#fee2e2', border:'#fca5a5', text:'#b91c1c', icon: XCircle },
  Dibatalkan: { bg:'#f1f5f9', border:'#e2e8f0', text:'#94a3b8', icon: Ban },
}

// Summary card theme (urutan sama dengan STATUS_DEF)
const SUMMARY_THEME = [
  { key:'menunggu',   label:'Menunggu',   icon: STATUS_THEME.Menunggu.icon,   bg: STATUS_THEME.Menunggu.bg,   border: STATUS_THEME.Menunggu.border,   color: STATUS_THEME.Menunggu.text },
  { key:'disetujui',  label:'Disetujui',  icon: STATUS_THEME.Disetujui.icon,  bg: STATUS_THEME.Disetujui.bg,  border: STATUS_THEME.Disetujui.border,  color: STATUS_THEME.Disetujui.text },
  { key:'ditolak',    label:'Ditolak',    icon: STATUS_THEME.Ditolak.icon,    bg: STATUS_THEME.Ditolak.bg,    border: STATUS_THEME.Ditolak.border,    color: STATUS_THEME.Ditolak.text },
  { key:'dibatalkan', label:'Dibatalkan', icon: STATUS_THEME.Dibatalkan.icon, bg: STATUS_THEME.Dibatalkan.bg, border: STATUS_THEME.Dibatalkan.border, color: STATUS_THEME.Dibatalkan.text },
]

function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Modal: ajukan cuti baru ────────────────────────────────
const showFormModal = ref(false)
const form = ref({ pegawaiId: '', jenisCuti: '', tanggalMulai: '', tanggalSelesai: '', alasan: '' })
const estimasiHari = computed(() => hitungEstimasiHari(form.value.tanggalMulai, form.value.tanggalSelesai))

function openForm() {
  form.value = { pegawaiId: '', jenisCuti: '', tanggalMulai: '', tanggalSelesai: '', alasan: '' }
  showFormModal.value = true
}
async function handleSubmit() {
  await ajukanCuti({ ...form.value })
  showFormModal.value = false
}

// ── Modal: setujui / tolak ────────────────────────────────
const actionModal = ref(null) // { mode: 'approve' | 'reject', request }
const actionNote  = ref('')

function openApprove(p) { actionModal.value = { mode: 'approve', request: p }; actionNote.value = '' }
function openReject(p)  { actionModal.value = { mode: 'reject',  request: p }; actionNote.value = '' }
function closeActionModal() { actionModal.value = null; actionNote.value = '' }

async function confirmAction() {
  if (!actionModal.value) return
  const { mode, request } = actionModal.value
  if (mode === 'reject' && !actionNote.value.trim()) return
  if (mode === 'approve') await setujuiPengajuan(request.id, actionNote.value)
  else await tolakPengajuan(request.id, actionNote.value)
  closeActionModal()
}
</script>

<template>
  <AppLayout breadcrumb="Manajemen Absensi / Pengajuan Cuti & Izin" title="Pengajuan Cuti & Izin">

    <!-- ════════ LOADING ════════ -->
    <div v-if="loading && !sortedList.length"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <Loader2 :size="48" class="text-sky-500 animate-spin" />
      <p class="text-slate-600 font-black text-sm tracking-widest uppercase">Memuat pengajuan...</p>
    </div>

    <!-- ════════ ERROR ════════ -->
    <div v-else-if="error && !sortedList.length"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div class="w-16 h-16 rounded-3xl bg-red-100 border-2 border-red-300 flex items-center justify-center">
        <AlertCircle :size="32" class="text-red-500" />
      </div>
      <p class="text-slate-800 font-black text-lg">{{ error }}</p>
      <button @click="fetchPengajuanCuti"
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
            {{ card.label }}
          </p>
          <h2 class="text-5xl sm:text-6xl font-black tabular-nums leading-none"
            :style="`color:${card.color}`">
            {{ summary?.[card.key] ?? 0 }}
          </h2>
          <p class="mt-2 text-[10px] font-black uppercase tracking-widest opacity-60"
            :style="`color:${card.color}`">Total Pengajuan</p>
        </div>
      </div>

      <!-- ── TOOLBAR ── -->
      <div class="d-card">
        <div class="flex flex-wrap items-center gap-3">

          <!-- Filter Status -->
          <select v-model="filterStatus" class="filter-select">
            <option value="">Semua Status</option>
            <option v-for="s in STATUS_DEF" :key="s.nama" :value="s.nama">{{ s.nama }}</option>
          </select>

          <!-- Filter Jenis -->
          <select v-model="filterJenis" class="filter-select">
            <option value="">Semua Jenis</option>
            <option v-for="j in JENIS_CUTI_DEF" :key="j.nama" :value="j.nama">{{ j.nama }}</option>
          </select>

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

          <div class="flex-1" />

          <!-- Refresh -->
          <button @click="fetchPengajuanCuti" class="tool-btn tool-btn-ghost">
            <RefreshCw :size="14" :class="loading ? 'animate-spin' : ''" />
            Refresh
          </button>

          <!-- Ajukan Cuti -->
          <button @click="openForm" class="tool-btn tool-btn-blue">
            <Plus :size="14" />
            Ajukan Cuti
          </button>
        </div>
      </div>

      <!-- ── TABEL PENGAJUAN ── -->
      <div class="d-card overflow-hidden p-0">

        <div class="px-5 sm:px-7 py-4 border-b-2 border-slate-100 flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Daftar</p>
            <h3 class="text-base font-black text-slate-800">
              {{ sortedList.length }} Pengajuan
              <span v-if="filterDivisi" class="text-sky-600">· {{ filterDivisi }}</span>
            </h3>
          </div>
          <Loader2 v-if="loading" :size="16" class="text-sky-400 animate-spin" />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full" style="min-width: 980px">
            <thead>
              <tr class="bg-slate-50 border-b-2 border-slate-100">
                <th class="d-th pl-6 w-[200px] sticky left-0 bg-slate-50 z-10">Pegawai</th>
                <th class="d-th">Jenis Cuti</th>
                <th class="d-th">Periode</th>
                <th class="d-th text-center">Hari</th>
                <th class="d-th">Alasan</th>
                <th class="d-th">Status</th>
                <th class="d-th text-right pr-6">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(p, ri) in sortedList" :key="p.id"
                class="request-row border-b border-slate-100"
                :style="`animation-delay:${Math.min(ri,12)*35}ms`"
              >
                <!-- Pegawai -->
                <td class="d-td pl-6 sticky left-0 bg-white z-10 border-r-2 border-slate-100">
                  <div class="flex items-center gap-2.5">
                    <div class="avatar-box">{{ p.nama.charAt(0) }}</div>
                    <div>
                      <p class="font-black text-sm text-slate-800 whitespace-nowrap">{{ p.nama }}</p>
                      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ p.divisi }}</p>
                    </div>
                  </div>
                </td>

                <!-- Jenis cuti -->
                <td class="d-td">
                  <span class="cuti-badge"
                    :style="`
                      background:${JENIS_THEME[p.jenisCuti]?.bg};
                      border-color:${JENIS_THEME[p.jenisCuti]?.border};
                      color:${JENIS_THEME[p.jenisCuti]?.text};
                    `">
                    <component :is="JENIS_THEME[p.jenisCuti]?.icon" :size="12" />
                    {{ p.jenisCuti }}
                  </span>
                </td>

                <!-- Periode -->
                <td class="d-td text-slate-600 font-bold text-xs whitespace-nowrap">
                  {{ formatTanggal(p.tanggalMulai) }} – {{ formatTanggal(p.tanggalSelesai) }}
                </td>

                <!-- Hari -->
                <td class="d-td text-center font-black text-slate-700 text-sm">{{ p.jumlahHari }}</td>

                <!-- Alasan -->
                <td class="d-td text-slate-600 text-xs max-w-[200px] truncate" :title="p.alasan">{{ p.alasan }}</td>

                <!-- Status -->
                <td class="d-td">
                  <span class="cuti-badge"
                    :style="`
                      background:${STATUS_THEME[p.status]?.bg};
                      border-color:${STATUS_THEME[p.status]?.border};
                      color:${STATUS_THEME[p.status]?.text};
                    `">
                    <component :is="STATUS_THEME[p.status]?.icon" :size="12" />
                    {{ p.status }}
                  </span>
                  <p v-if="p.catatan" class="text-[10px] font-bold text-slate-400 mt-1 max-w-[160px]">{{ p.catatan }}</p>
                </td>

                <!-- Aksi -->
                <td class="d-td text-right pr-6">
                  <div v-if="p.status === 'Menunggu'" class="flex justify-end gap-1.5">
                    <button @click="openApprove(p)" :disabled="actionLoading" class="row-btn row-btn-green">Setujui</button>
                    <button @click="openReject(p)" :disabled="actionLoading" class="row-btn row-btn-red">Tolak</button>
                  </div>
                  <span v-else class="text-slate-300 font-black text-xs">—</span>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-if="!sortedList.length && !loading">
                <td colspan="7" class="py-14 text-center">
                  <p class="font-black text-slate-400 text-sm tracking-wide">
                    Tidak ada pengajuan ditemukan
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── SISA JATAH CUTI TAHUNAN ── -->
      <div class="d-card">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Sisa Jatah Cuti Tahunan</p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="s in sisaCutiList" :key="s.pegawaiId" class="quota-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-black text-sm text-slate-800">{{ s.nama }}</p>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ s.divisi }}</p>
              </div>
              <span class="font-black text-lg tabular-nums" :style="`color:${s.sisa <= 2 ? '#b91c1c' : '#15803d'}`">
                {{ s.sisa }}
              </span>
            </div>
            <div class="progress-track mt-3">
              <div class="progress-fill"
                :style="`width:${Math.min(100,(s.terpakai/s.jatah)*100)}%; background:${s.sisa <= 2 ? '#fca5a5' : '#86efac'}`"></div>
            </div>
            <p class="mt-1.5 text-[10px] font-bold text-slate-400">Terpakai {{ s.terpakai }} dari {{ s.jatah }} hari</p>
          </div>
        </div>
      </div>

      <!-- ── LEGEND ── -->
      <div class="d-card">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Keterangan Jenis Cuti</p>
        <div class="flex flex-wrap gap-3 mb-5">
          <div v-for="j in JENIS_CUTI_DEF" :key="j.nama" class="legend-chip"
            :style="`background:${JENIS_THEME[j.nama]?.bg}; border-color:${JENIS_THEME[j.nama]?.border}`">
            <component :is="JENIS_THEME[j.nama]?.icon" :size="14" :style="`color:${JENIS_THEME[j.nama]?.text}`" />
            <p class="text-xs font-black" :style="`color:${JENIS_THEME[j.nama]?.text}`">{{ j.nama }}</p>
          </div>
        </div>
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Keterangan Status</p>
        <div class="flex flex-wrap gap-3">
          <div v-for="s in STATUS_DEF" :key="s.nama" class="legend-chip"
            :style="`background:${STATUS_THEME[s.nama]?.bg}; border-color:${STATUS_THEME[s.nama]?.border}`">
            <component :is="STATUS_THEME[s.nama]?.icon" :size="14" :style="`color:${STATUS_THEME[s.nama]?.text}`" />
            <p class="text-xs font-black" :style="`color:${STATUS_THEME[s.nama]?.text}`">{{ s.nama }}</p>
          </div>
        </div>
      </div>

      <div class="h-4" />
    </div>

    <!-- ════════ MODAL: AJUKAN CUTI ════════ -->
    <Teleport to="body">
      <div v-if="showFormModal" class="modal-overlay">
        <div class="modal-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-lg text-slate-800">Ajukan Cuti Baru</h3>
            <button @click="showFormModal=false" class="modal-close"><X :size="16" /></button>
          </div>
          <form @submit.prevent="handleSubmit" class="space-y-3">
            <div>
              <label class="modal-label">Pegawai</label>
              <select v-model="form.pegawaiId" required class="modal-input">
                <option value="" disabled>Pilih pegawai</option>
                <option v-for="p in sisaCutiList" :key="p.pegawaiId" :value="p.pegawaiId">{{ p.nama }} — {{ p.divisi }}</option>
              </select>
            </div>
            <div>
              <label class="modal-label">Jenis Cuti</label>
              <select v-model="form.jenisCuti" required class="modal-input">
                <option value="" disabled>Pilih jenis cuti</option>
                <option v-for="j in JENIS_CUTI_DEF" :key="j.nama" :value="j.nama">{{ j.nama }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="modal-label">Tanggal Mulai</label>
                <input v-model="form.tanggalMulai" type="date" required class="modal-input" />
              </div>
              <div>
                <label class="modal-label">Tanggal Selesai</label>
                <input v-model="form.tanggalSelesai" type="date" required class="modal-input" />
              </div>
            </div>
            <p class="text-xs font-bold text-sky-600">Estimasi {{ estimasiHari }} hari kerja</p>
            <div>
              <label class="modal-label">Alasan</label>
              <textarea v-model="form.alasan" required rows="3" class="modal-input resize-none"
                placeholder="Jelaskan alasan pengajuan..."></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="showFormModal=false" class="tool-btn tool-btn-ghost">Batal</button>
              <button type="submit" :disabled="submitLoading" class="tool-btn tool-btn-green">
                <Loader2 v-if="submitLoading" :size="14" class="animate-spin" />
                <Send v-else :size="14" />
                {{ submitLoading ? 'Mengirim...' : 'Kirim Pengajuan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ════════ MODAL: SETUJUI / TOLAK ════════ -->
    <Teleport to="body">
      <div v-if="actionModal" class="modal-overlay">
        <div class="modal-card max-w-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-lg text-slate-800">
              {{ actionModal.mode === 'approve' ? 'Setujui Pengajuan' : 'Tolak Pengajuan' }}
            </h3>
            <button @click="closeActionModal" class="modal-close"><X :size="16" /></button>
          </div>
          <p class="text-sm text-slate-600 mb-3">
            {{ actionModal.mode === 'approve' ? 'Setujui' : 'Tolak' }} cuti
            <span class="font-black text-slate-800">{{ actionModal.request.nama }}</span>
            ({{ actionModal.request.jenisCuti }}, {{ actionModal.request.jumlahHari }} hari)?
          </p>
          <label class="modal-label">
            {{ actionModal.mode === 'approve' ? 'Catatan (opsional)' : 'Alasan penolakan' }}
          </label>
          <textarea v-model="actionNote" rows="3" class="modal-input resize-none"
            :placeholder="actionModal.mode === 'approve' ? 'Tambahkan catatan...' : 'Wajib diisi...'"></textarea>
          <div class="flex justify-end gap-2 pt-3">
            <button @click="closeActionModal" class="tool-btn tool-btn-ghost">Batal</button>
            <button @click="confirmAction"
              :disabled="actionLoading || (actionModal.mode === 'reject' && !actionNote.trim())"
              class="tool-btn" :class="actionModal.mode === 'approve' ? 'tool-btn-green' : 'tool-btn-red'">
              <Loader2 v-if="actionLoading" :size="14" class="animate-spin" />
              <span v-else>{{ actionModal.mode === 'approve' ? 'Setujui' : 'Tolak' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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

.tool-btn-red { background:#fee2e2; border-color:#fca5a5; color:#b91c1c; }
.tool-btn-red:hover { background:#fecaca; border-color:#f87171; }

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
   REQUEST ROW
══════════════════════════════════════════════════════ */
.request-row {
  animation: rowIn 0.28s ease both;
  transition: background 0.12s;
}
.request-row:hover { background:#f8fafc; }
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
   BADGE (jenis cuti & status)
══════════════════════════════════════════════════════ */
.cuti-badge {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px;
  border-radius:9px;
  font-size:11px; font-weight:900;
  border:2px solid;
  letter-spacing:0.02em;
  white-space:nowrap;
}

/* ══════════════════════════════════════════════════════
   ROW ACTION BUTTONS (Setujui / Tolak)
══════════════════════════════════════════════════════ */
.row-btn {
  padding:6px 12px;
  border-radius:10px;
  font-size:11px; font-weight:900;
  border:2px solid transparent;
  cursor:pointer;
  transition:all 0.15s;
}
.row-btn:hover  { transform:translateY(-1px); }
.row-btn:active { transform:scale(0.95); }
.row-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

.row-btn-green { background:#dcfce7; border-color:#86efac; color:#15803d; }
.row-btn-green:hover { background:#bbf7d0; border-color:#4ade80; }

.row-btn-red { background:#fee2e2; border-color:#fca5a5; color:#b91c1c; }
.row-btn-red:hover { background:#fecaca; border-color:#f87171; }

/* ══════════════════════════════════════════════════════
   LEGEND CHIP
══════════════════════════════════════════════════════ */
.legend-chip {
  display:flex; align-items:center; gap:8px;
  padding:8px 12px;
  border-radius:12px;
  border:2px solid;
}

/* ══════════════════════════════════════════════════════
   QUOTA CARD (sisa cuti tahunan)
══════════════════════════════════════════════════════ */
.quota-card {
  border:2px solid #f1f5f9;
  background:#f8fafc;
  border-radius:16px;
  padding:14px;
}
.progress-track {
  height:8px;
  border-radius:999px;
  background:#e2e8f0;
  overflow:hidden;
}
.progress-fill {
  height:100%;
  border-radius:999px;
  transition:width 0.3s;
}

/* ══════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════ */
.modal-overlay {
  position:fixed; inset:0; z-index:50;
  background:rgba(15,23,42,0.45);
  display:flex; align-items:center; justify-content:center;
  padding:16px;
  backdrop-filter: blur(2px);
}
.modal-card {
  width:100%; max-width:460px;
  background:#fff;
  border-radius:24px;
  border:2.5px solid #e2e8f0;
  padding:24px;
  box-shadow:0 20px 60px rgba(0,0,0,0.18);
  animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes modalIn {
  from { opacity:0; transform:scale(0.94) translateY(10px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}
.modal-close {
  width:30px; height:30px;
  border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  background:#f1f5f9; color:#64748b;
  transition: all 0.15s;
  border:none; cursor:pointer;
}
.modal-close:hover { background:#e2e8f0; color:#0f172a; }

.modal-label {
  display:block;
  font-size:10px; font-weight:900;
  text-transform:uppercase; letter-spacing:0.08em;
  color:#94a3b8;
  margin-bottom:5px;
}
.modal-input {
  width:100%;
  padding:9px 12px;
  border-radius:12px;
  border:2.5px solid #e2e8f0;
  font-size:13px; font-weight:700;
  color:#0f172a;
  outline:none;
  transition:border-color 0.15s;
}
.modal-input:focus { border-color:#7dd3fc; }

/* ══════════════════════════════════════════════════════
   SCROLLBAR
══════════════════════════════════════════════════════ */
::-webkit-scrollbar { height:4px; width:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
</style>