/**
 * ============================================================
 *  FILE: src/composables/useLogKehadiran.js
 *
 *  ✅ BACKEND: Set USE_MOCK = false dan pastikan endpoint
 *             /api/log-kehadiran sudah siap.
 *
 *  ✅ FRONTEND: Jangan ubah file ini.
 *              Semua tampilan ada di LogKehadiran.vue
 * ============================================================
 */

import { ref, computed, watch } from 'vue'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ── Set true = pakai data dummy, false = pakai API nyata ──
const USE_MOCK = true

// ── Data dummy (hapus/abaikan saat backend sudah siap) ────
const MOCK_LOGS = [
  { id:1,  nik:'10001', nama:'Andi Saputra',    divisi:'Produksi', shift:'Pagi',  jam_masuk:'06:01', jam_keluar:'14:02', durasi:'8j 1m',  status:'Hadir',     keterangan:'',          tanggal:'2025-06-10' },
  { id:2,  nik:'10002', nama:'Budi Santoso',     divisi:'QC',       shift:'Pagi',  jam_masuk:'06:03', jam_keluar:'14:05', durasi:'8j 2m',  status:'Hadir',     keterangan:'',          tanggal:'2025-06-10' },
  { id:3,  nik:'10003', nama:'Rudi Hartono',     divisi:'Gudang',   shift:'Pagi',  jam_masuk:'06:19', jam_keluar:'14:10', durasi:'7j 51m', status:'Terlambat', keterangan:'Macet',     tanggal:'2025-06-10' },
  { id:4,  nik:'10004', nama:'Fajar Nugroho',    divisi:'Teknik',   shift:'Siang', jam_masuk:'14:01', jam_keluar:'22:00', durasi:'7j 59m', status:'Hadir',     keterangan:'',          tanggal:'2025-06-10' },
  { id:5,  nik:'10005', nama:'Joko Widodo',      divisi:'Teknik',   shift:'Siang', jam_masuk:'14:22', jam_keluar:'22:05', durasi:'7j 43m', status:'Terlambat', keterangan:'Ban bocor', tanggal:'2025-06-10' },
  { id:6,  nik:'10006', nama:'Siti Aminah',      divisi:'Produksi', shift:'Pagi',  jam_masuk:null,    jam_keluar:null,    durasi:null,     status:'Izin',      keterangan:'Sakit',     tanggal:'2025-06-10' },
  { id:7,  nik:'10007', nama:'Dewi Rahayu',      divisi:'Administrasi', shift:'Pagi', jam_masuk:'06:00', jam_keluar:'14:00', durasi:'8j 0m', status:'Hadir', keterangan:'',          tanggal:'2025-06-10' },
  { id:8,  nik:'10008', nama:'Hendra Kusuma',    divisi:'Produksi', shift:'Malam', jam_masuk:'22:05', jam_keluar:'06:00', durasi:'7j 55m', status:'Hadir',     keterangan:'',          tanggal:'2025-06-10' },
  { id:9,  nik:'10009', nama:'Wahyu Pratama',    divisi:'Gudang',   shift:'Malam', jam_masuk:null,    jam_keluar:null,    durasi:null,     status:'Alpha',     keterangan:'',          tanggal:'2025-06-10' },
  { id:10, nik:'10010', nama:'Rizki Firmansyah', divisi:'QC',       shift:'Pagi',  jam_masuk:'06:02', jam_keluar:'14:01', durasi:'7j 59m', status:'Hadir',     keterangan:'',          tanggal:'2025-06-10' },
  { id:11, nik:'10011', nama:'Agus Salim',       divisi:'Produksi', shift:'Siang', jam_masuk:'14:00', jam_keluar:'22:00', durasi:'8j 0m',  status:'Hadir',     keterangan:'',          tanggal:'2025-06-10' },
  { id:12, nik:'10012', nama:'Nurul Hidayah',    divisi:'Administrasi', shift:'Pagi', jam_masuk:null, jam_keluar:null,   durasi:null,     status:'Izin',      keterangan:'Cuti tahunan', tanggal:'2025-06-10' },
]

const MOCK_SUMMARY = {
  hadir:     8,
  terlambat: 2,
  izin:      2,
  alpha:     1,
  total:     12,
}

// ── State ──────────────────────────────────────────────────
export function useLogKehadiran() {
  const loading    = ref(false)
  const error      = ref(null)
  const logs       = ref([])
  const summary    = ref(null)
  const pagination = ref({ page: 1, perPage: 15, total: 0, totalPages: 1 })

  const filter = ref({
    search:  '',
    tanggal: '',
    shift:   '',
    status:  '',
    divisi:  '',
  })

  // ── Debounce search ──
  let searchTimer = null
  watch(() => filter.value.search, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => { pagination.value.page = 1; fetchLogs() }, 400)
  })

  watch(
    [
      () => filter.value.tanggal,
      () => filter.value.shift,
      () => filter.value.status,
      () => filter.value.divisi,
      () => pagination.value.page,
    ],
    () => fetchLogs(),
  )

  // ── Fetch / mock ──────────────────────────────────────────
  async function fetchLogs() {
    loading.value = true
    error.value   = null

    // ══ MOCK MODE ══════════════════════════════════════════
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 350)) // simulasi network

      let filtered = MOCK_LOGS.filter(l => {
        const q = filter.value.search.toLowerCase()
        if (q && !l.nama.toLowerCase().includes(q) && !l.nik.includes(q)) return false
        if (filter.value.shift  && l.shift  !== filter.value.shift)  return false
        if (filter.value.status && l.status !== filter.value.status) return false
        if (filter.value.divisi && l.divisi !== filter.value.divisi) return false
        return true
      })

      const total      = filtered.length
      const perPage    = pagination.value.perPage
      const page       = pagination.value.page
      const totalPages = Math.max(1, Math.ceil(total / perPage))
      const start      = (page - 1) * perPage

      logs.value = filtered.slice(start, start + perPage)
      summary.value = {
        hadir:     filtered.filter(l => l.status === 'Hadir').length,
        terlambat: filtered.filter(l => l.status === 'Terlambat').length,
        izin:      filtered.filter(l => l.status === 'Izin').length,
        alpha:     filtered.filter(l => l.status === 'Alpha').length,
        total:     filtered.length,
      }
      pagination.value = { ...pagination.value, total, totalPages }
      loading.value = false
      return
    }

    // ══ API MODE (aktifkan saat backend siap) ══════════════
    try {
      const q = new URLSearchParams({
        page:    pagination.value.page,
        perPage: pagination.value.perPage,
        search:  filter.value.search,
        tanggal: filter.value.tanggal,
        shift:   filter.value.shift,
        status:  filter.value.status,
        divisi:  filter.value.divisi,
      })
      const res  = await fetch(`${BASE_URL}/api/log-kehadiran?${q}`)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()

      logs.value       = data.logs       ?? []
      summary.value    = data.summary    ?? null
      pagination.value = { ...pagination.value, ...data.pagination }
    } catch (e) {
      error.value = e.message ?? 'Gagal memuat data'
    } finally {
      loading.value = false
    }
  }

  // ── Export Excel ──────────────────────────────────────────
  async function exportExcel() {
    if (USE_MOCK) { alert('Export tersedia saat backend sudah aktif.'); return }
    try {
      const q = new URLSearchParams({
        tanggal: filter.value.tanggal,
        shift:   filter.value.shift,
        status:  filter.value.status,
        divisi:  filter.value.divisi,
        search:  filter.value.search,
      })
      const res  = await fetch(`${BASE_URL}/api/log-kehadiran/export?${q}`)
      if (!res.ok) throw new Error('Gagal export')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `log-kehadiran-${filter.value.tanggal || 'semua'}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Export gagal: ' + e.message)
    }
  }

  // ── Reset filter ──────────────────────────────────────────
  function resetFilter() {
    filter.value = { search: '', tanggal: '', shift: '', status: '', divisi: '' }
    pagination.value.page = 1
    fetchLogs()
  }

  function goToPage(p) {
    if (p < 1 || p > pagination.value.totalPages) return
    pagination.value.page = p
  }

  const hasFilter = computed(() =>
    Object.values(filter.value).some(v => v !== '')
  )

  // Auto-fetch on mount
  fetchLogs()

  return {
    loading, error,
    logs, summary, pagination, filter, hasFilter,
    fetchLogs, exportExcel, resetFilter, goToPage,
  }
}