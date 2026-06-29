/**
 * ============================================================
 *  FILE: src/composables/useLogLembur.js
 *
 *  ✅ BACKEND: Set USE_MOCK = false dan pastikan endpoint
 *             /api/log-lembur sudah siap.
 *
 *  ✅ FRONTEND: Jangan ubah file ini.
 *              Semua tampilan ada di LogLembur.vue
 * ============================================================
 */

import { ref, computed, watch } from 'vue'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ── Set true = pakai data dummy, false = pakai API nyata ──
const USE_MOCK = true

// ── Jenis hari lembur (statis, sinkron dengan backend) ─────
export const JENIS_LEMBUR_DEF = [
  { nama: 'Hari Kerja',                 multiplier: 1.5, warna: 'sky'    },
  { nama: 'Hari Libur / Tanggal Merah', multiplier: 2,   warna: 'violet' },
]

// ── Status pengajuan (statis, sinkron dengan backend) ─────
export const STATUS_DEF = [
  { nama: 'Menunggu',  warna: 'amber'   },
  { nama: 'Disetujui', warna: 'emerald' },
  { nama: 'Ditolak',   warna: 'rose'    },
]

const RATE_PER_JAM      = 25000  // Rp/jam, tarif dasar lembur sebelum dikali multiplier
const LIMIT_JAM_BULANAN = 40     // batas wajar jam lembur/bulan per pegawai (acuan internal)

// ── Mock data pegawai ──────────────────────────────────────
const MOCK_PEGAWAI = [
  { id:1,  nama:'Andi Saputra',     divisi:'Produksi'     },
  { id:2,  nama:'Budi Santoso',     divisi:'QC'           },
  { id:3,  nama:'Rudi Hartono',     divisi:'Gudang'       },
  { id:4,  nama:'Fajar Nugroho',    divisi:'Teknik'       },
  { id:5,  nama:'Joko Widodo',      divisi:'Teknik'       },
  { id:6,  nama:'Siti Aminah',      divisi:'Produksi'     },
  { id:7,  nama:'Dewi Rahayu',      divisi:'Administrasi' },
  { id:8,  nama:'Hendra Kusuma',    divisi:'Produksi'     },
  { id:9,  nama:'Wahyu Pratama',    divisi:'Gudang'       },
  { id:10, nama:'Rizki Firmansyah', divisi:'QC'           },
  { id:11, nama:'Agus Salim',       divisi:'Produksi'     },
  { id:12, nama:'Nurul Hidayah',    divisi:'Administrasi' },
]

// ── Helper tanggal & jam ────────────────────────────────────
function toISO(d) { return d.toISOString().slice(0, 10) }

function getMonthRange(offsetMonth = 0) {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth() + offsetMonth, 1)
  const end   = new Date(today.getFullYear(), today.getMonth() + offsetMonth + 1, 0)
  return {
    start, end,
    daysInMonth: end.getDate(),
    label: start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
  }
}

// Hitung durasi dalam jam (mendukung lembur lewat tengah malam)
function hitungDurasiJam(jamMulai, jamSelesai) {
  const [h1, m1] = jamMulai.split(':').map(Number)
  const [h2, m2] = jamSelesai.split(':').map(Number)
  let menit = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (menit <= 0) menit += 24 * 60
  return Math.round((menit / 60) * 100) / 100
}

function hitungUpah(durasiJam, jenisHari) {
  const jenis = JENIS_LEMBUR_DEF.find(j => j.nama === jenisHari)
  const multiplier = jenis?.multiplier ?? 1.5
  return Math.round(durasiJam * RATE_PER_JAM * multiplier)
}

// ── Seed log deterministik supaya konsisten ────────────────
function buildMockLog(monthRange) {
  const { start, daysInMonth } = monthRange
  const seed = [
    { pegawaiId:1,  hari:3,  jamMulai:'17:00', jamSelesai:'20:00', jenisHari:'Hari Kerja',                 alasan:'Mengejar target produksi gula harian',   status:'Disetujui' },
    { pegawaiId:2,  hari:5,  jamMulai:'18:00', jamSelesai:'21:30', jenisHari:'Hari Kerja',                 alasan:'Pengecekan QC tambahan batch malam',     status:'Disetujui' },
    { pegawaiId:3,  hari:7,  jamMulai:'08:00', jamSelesai:'14:00', jenisHari:'Hari Libur / Tanggal Merah', alasan:'Stok ulang gudang sebelum musim giling', status:'Menunggu'  },
    { pegawaiId:4,  hari:9,  jamMulai:'17:00', jamSelesai:'19:00', jenisHari:'Hari Kerja',                 alasan:'Perbaikan mesin giling unit 2',          status:'Disetujui' },
    { pegawaiId:5,  hari:10, jamMulai:'22:00', jamSelesai:'02:00', jenisHari:'Hari Kerja',                 alasan:'Standby teknisi shift malam',            status:'Ditolak', catatan:'Jam lembur tidak sesuai jadwal mesin' },
    { pegawaiId:6,  hari:12, jamMulai:'17:00', jamSelesai:'20:00', jenisHari:'Hari Kerja',                 alasan:'Menyelesaikan laporan produksi mingguan',status:'Menunggu'  },
    { pegawaiId:8,  hari:14, jamMulai:'17:00', jamSelesai:'21:00', jenisHari:'Hari Kerja',                 alasan:'Lembur produksi tambahan',               status:'Disetujui' },
    { pegawaiId:9,  hari:15, jamMulai:'08:00', jamSelesai:'13:00', jenisHari:'Hari Libur / Tanggal Merah', alasan:'Bongkar muat tebu darurat',              status:'Disetujui' },
    { pegawaiId:11, hari:18, jamMulai:'17:00', jamSelesai:'19:30', jenisHari:'Hari Kerja',                 alasan:'Lembur shift produksi',                  status:'Menunggu'  },
    { pegawaiId:4,  hari:20, jamMulai:'17:00', jamSelesai:'22:00', jenisHari:'Hari Kerja',                 alasan:'Perbaikan darurat panel listrik',        status:'Disetujui' },
    { pegawaiId:1,  hari:22, jamMulai:'17:00', jamSelesai:'19:00', jenisHari:'Hari Kerja',                 alasan:'Lembur penyesuaian target mingguan',     status:'Disetujui' },
    { pegawaiId:10, hari:24, jamMulai:'17:00', jamSelesai:'20:00', jenisHari:'Hari Kerja',                 alasan:'Verifikasi ulang hasil QC',              status:'Menunggu'  },
  ]

  return seed
    .filter(s => s.hari <= daysInMonth)
    .map((s, i) => {
      const pegawai      = MOCK_PEGAWAI.find(p => p.id === s.pegawaiId)
      const tanggal       = toISO(new Date(start.getFullYear(), start.getMonth(), s.hari))
      const durasiJam     = hitungDurasiJam(s.jamMulai, s.jamSelesai)
      const estimasiUpah  = hitungUpah(durasiJam, s.jenisHari)
      return {
        id:             i + 1,
        pegawaiId:      s.pegawaiId,
        nama:           pegawai?.nama  ?? '-',
        divisi:         pegawai?.divisi ?? '-',
        tanggal,
        jamMulai:       s.jamMulai,
        jamSelesai:     s.jamSelesai,
        durasiJam,
        jenisHari:      s.jenisHari,
        alasan:         s.alasan,
        status:         s.status,
        disetujuiOleh:  s.status === 'Disetujui' ? 'HRD - Maria Susanti' : null,
        catatan:        s.catatan ?? null,
        estimasiUpah,
      }
    })
}

// ── Summary helper ────────────────────────────────────────
function buildSummary(list) {
  const disetujui = list.filter(p => p.status === 'Disetujui')
  return {
    menunggu:           list.filter(p => p.status === 'Menunggu').length,
    disetujui:          disetujui.length,
    ditolak:            list.filter(p => p.status === 'Ditolak').length,
    totalJamDisetujui:  Math.round(disetujui.reduce((acc, p) => acc + p.durasiJam, 0) * 100) / 100,
    totalUpahDisetujui: disetujui.reduce((acc, p) => acc + p.estimasiUpah, 0),
  }
}

// Rekap jam lembur disetujui per pegawai bulan berjalan
function buildRekapPegawai(list) {
  return MOCK_PEGAWAI.map(p => {
    const totalJam = list
      .filter(x => x.pegawaiId === p.id && x.status === 'Disetujui')
      .reduce((acc, x) => acc + x.durasiJam, 0)
    return {
      pegawaiId: p.id,
      nama:      p.nama,
      divisi:    p.divisi,
      totalJam:  Math.round(totalJam * 100) / 100,
      limit:     LIMIT_JAM_BULANAN,
    }
  })
}

// ══════════════════════════════════════════════════════════
export function useLogLembur() {
  const loading       = ref(false)
  const error         = ref(null)
  const submitLoading = ref(false)
  const actionLoading = ref(false)

  const monthOffset = ref(0)     // 0 = bulan ini, -1 = bulan lalu, +1 = bulan depan
  const monthLabel  = ref('')

  const logList      = ref([])   // semua data log lembur bulan berjalan
  const summary      = ref(null) // ringkasan jumlah per status + total jam/upah
  const rekapPegawai = ref([])   // rekap jam lembur disetujui per pegawai

  // Filter
  const filterStatus    = ref('')
  const filterJenisHari = ref('')
  const filterDivisi    = ref('')
  const filterSearch    = ref('')

  const DIVISI_LIST = [...new Set(MOCK_PEGAWAI.map(p => p.divisi))].sort()

  // ── Computed: list setelah difilter ────────────────────
  const filteredList = computed(() => {
    return logList.value.filter(p => {
      if (filterStatus.value    && p.status !== filterStatus.value)       return false
      if (filterJenisHari.value && p.jenisHari !== filterJenisHari.value) return false
      if (filterDivisi.value    && p.divisi !== filterDivisi.value)       return false
      if (filterSearch.value && !p.nama.toLowerCase().includes(filterSearch.value.toLowerCase())) return false
      return true
    })
  })

  // Diurutkan: Menunggu paling atas, lalu tanggal terbaru
  const sortedList = computed(() => {
    const urutanStatus = { Menunggu: 0, Disetujui: 1, Ditolak: 2 }
    return [...filteredList.value].sort((a, b) => {
      if (urutanStatus[a.status] !== urutanStatus[b.status]) {
        return urutanStatus[a.status] - urutanStatus[b.status]
      }
      return new Date(b.tanggal) - new Date(a.tanggal)
    })
  })

  // ── Navigasi bulan ──────────────────────────────────────
  function prevMonth()      { monthOffset.value-- }
  function nextMonth()      { monthOffset.value++ }
  function goCurrentMonth() { monthOffset.value = 0 }

  watch(monthOffset, () => fetchLogLembur())

  // ── Fetch / mock ───────────────────────────────────────
  async function fetchLogLembur() {
    loading.value = true
    error.value   = null

    const range = getMonthRange(monthOffset.value)
    monthLabel.value = range.label

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      logList.value      = buildMockLog(range)
      summary.value       = buildSummary(logList.value)
      rekapPegawai.value  = buildRekapPegawai(logList.value)
      loading.value       = false
      return
    }

    try {
      const bulan = `${range.start.getFullYear()}-${String(range.start.getMonth() + 1).padStart(2, '0')}`
      const res   = await fetch(`${BASE_URL}/api/log-lembur?bulan=${bulan}`)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      /**
       * Backend wajib mengembalikan:
       * {
       *   log: [
       *     {
       *       id, pegawaiId, nama, divisi,
       *       tanggal, jamMulai, jamSelesai, durasiJam,
       *       jenisHari, alasan, status,
       *       disetujuiOleh, catatan, estimasiUpah
       *     }
       *   ],
       *   summary: { menunggu, disetujui, ditolak, totalJamDisetujui, totalUpahDisetujui },
       *   rekapPegawai: [ { pegawaiId, nama, divisi, totalJam, limit } ]
       * }
       */
      logList.value      = data.log          ?? []
      summary.value       = data.summary      ?? null
      rekapPegawai.value  = data.rekapPegawai ?? []
    } catch (e) {
      error.value = e.message ?? 'Gagal memuat data log lembur'
    } finally {
      loading.value = false
    }
  }

  // ── Catat lembur baru ───────────────────────────────────
  async function ajukanLembur({ pegawaiId, tanggal, jamMulai, jamSelesai, jenisHari, alasan }) {
    submitLoading.value = true
    error.value = null

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      const pegawai      = MOCK_PEGAWAI.find(p => p.id === pegawaiId)
      const durasiJam     = hitungDurasiJam(jamMulai, jamSelesai)
      const estimasiUpah  = hitungUpah(durasiJam, jenisHari)
      const baru = {
        id:            Math.max(0, ...logList.value.map(p => p.id)) + 1,
        pegawaiId,
        nama:          pegawai?.nama  ?? '-',
        divisi:        pegawai?.divisi ?? '-',
        tanggal, jamMulai, jamSelesai, durasiJam,
        jenisHari, alasan,
        status:        'Menunggu',
        disetujuiOleh: null,
        catatan:       null,
        estimasiUpah,
      }
      logList.value      = [baru, ...logList.value]
      summary.value       = buildSummary(logList.value)
      rekapPegawai.value  = buildRekapPegawai(logList.value)
      submitLoading.value = false
      alert('Lembur berhasil dicatat! (mock)')
      return baru
    }

    try {
      const res = await fetch(`${BASE_URL}/api/log-lembur`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pegawaiId, tanggal, jamMulai, jamSelesai, jenisHari, alasan }),
      })
      if (!res.ok) throw new Error('Gagal mencatat lembur')
      const data = await res.json()
      await fetchLogLembur()
      return data
    } catch (e) {
      error.value = e.message ?? 'Gagal mencatat lembur'
      alert('Pencatatan gagal: ' + error.value)
    } finally {
      submitLoading.value = false
    }
  }

  // ── Setujui lembur ──────────────────────────────────────
  async function setujuiLembur(id, catatan = '') {
    actionLoading.value = true

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      const p = logList.value.find(x => x.id === id)
      if (p) {
        p.status        = 'Disetujui'
        p.disetujuiOleh = 'HRD - Maria Susanti'
        p.catatan       = catatan || null
      }
      summary.value      = buildSummary(logList.value)
      rekapPegawai.value = buildRekapPegawai(logList.value)
      actionLoading.value = false
      return
    }

    try {
      const res = await fetch(`${BASE_URL}/api/log-lembur/${id}/setujui`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ catatan }),
      })
      if (!res.ok) throw new Error('Gagal menyetujui lembur')
      await fetchLogLembur()
    } catch (e) {
      alert('Gagal menyetujui: ' + e.message)
    } finally {
      actionLoading.value = false
    }
  }

  // ── Tolak lembur ────────────────────────────────────────
  async function tolakLembur(id, alasanTolak) {
    actionLoading.value = true

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      const p = logList.value.find(x => x.id === id)
      if (p) {
        p.status  = 'Ditolak'
        p.catatan = alasanTolak
      }
      summary.value = buildSummary(logList.value)
      actionLoading.value = false
      return
    }

    try {
      const res = await fetch(`${BASE_URL}/api/log-lembur/${id}/tolak`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ alasan: alasanTolak }),
      })
      if (!res.ok) throw new Error('Gagal menolak lembur')
      await fetchLogLembur()
    } catch (e) {
      alert('Gagal menolak: ' + e.message)
    } finally {
      actionLoading.value = false
    }
  }

  // ── Helper publik untuk form (estimasi durasi & upah) ──
  function hitungEstimasi(jamMulai, jamSelesai, jenisHari) {
    if (!jamMulai || !jamSelesai || !jenisHari) return { durasiJam: 0, estimasiUpah: 0 }
    const durasiJam = hitungDurasiJam(jamMulai, jamSelesai)
    return { durasiJam, estimasiUpah: hitungUpah(durasiJam, jenisHari) }
  }

  // Mount
  fetchLogLembur()

  return {
    loading, error, submitLoading, actionLoading,
    monthOffset, monthLabel,
    logList, filteredList, sortedList, summary, rekapPegawai,
    filterStatus, filterJenisHari, filterDivisi, filterSearch,
    DIVISI_LIST, JENIS_LEMBUR_DEF, STATUS_DEF, RATE_PER_JAM,
    prevMonth, nextMonth, goCurrentMonth,
    fetchLogLembur, ajukanLembur, setujuiLembur, tolakLembur,
    hitungEstimasi,
  }
}