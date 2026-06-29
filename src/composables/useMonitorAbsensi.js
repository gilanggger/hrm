/**
 * ============================================================
 *  FILE: src/composables/useMonitorAbsensi.js
 *  PURPOSE: Monitor Absensi (stats, shift summary, rekap logs)
 *
 *  NOTES (UI in views/MonitorAbsensi.vue):
 *  - Debounce search 300ms (di composable)
 *  - Sorting per kolom (toggle asc/desc)
 *  - Pagination client-side (10 baris/halaman)
 *  - activeFilterCount untuk badge indikator
 *  - resetFilters untuk reset search + shift + status
 *  - lastUpdated untuk timestamp terakhir fetch
 *  - exportCSV download data yang sedang terfilter
 * ============================================================
 */

import { ref, computed, watch } from 'vue'
import {
  getAbsensiStats,
  getShiftSummary,
  getAbsensiSummary,
  getAbsensiLogs,
} from '@/api/monitorAbsensi'

// ── Konstanta ───────────────────────────────────────────────
const PAGE_SIZE = 10
const DEBOUNCE_MS = 300

// ── DUMMY DATA (hapus setelah backend siap) ──────────────────
const DUMMY = {
  stats: [
    { title: 'Total Hadir', value: 328 },
    { title: 'Terlambat', value: 8 },
    { title: 'Izin', value: 12 },
    { title: 'Alpha', value: 4 },
  ],
  shiftData: [
    { label: 'Pagi', hadir: 140, total: 148 },
    { label: 'Siang', hadir: 105, total: 112 },
    { label: 'Malam', hadir: 83, total: 92 },
  ],
  summary: {
    totalPegawai: 352,
    tingkatKehadiran: '93.2%',
    shiftAktif: 3,
  },
  logs: [
    {
      id: 1,
      name: 'Andi Saputra',
      division: 'Produksi',
      shift: 'Pagi',
      checkIn: '06:01',
      checkOut: '14:02',
      status: 'Hadir',
      late: 0,
    },
    {
      id: 2,
      name: 'Budi Santoso',
      division: 'QC',
      shift: 'Pagi',
      checkIn: '06:03',
      checkOut: '14:05',
      status: 'Hadir',
      late: 0,
    },
    {
      id: 3,
      name: 'Ahmad Rizki',
      division: 'Produksi',
      shift: 'Pagi',
      checkIn: '06:28',
      checkOut: '14:30',
      status: 'Terlambat',
      late: 18,
    },
    {
      id: 4,
      name: 'Yoga Pratama',
      division: 'Gudang',
      shift: 'Siang',
      checkIn: '14:12',
      checkOut: '-',
      status: 'Terlambat',
      late: 12,
    },
    {
      id: 5,
      name: 'Rudi Hartono',
      division: 'Gudang',
      shift: 'Pagi',
      checkIn: '06:05',
      checkOut: '14:07',
      status: 'Hadir',
      late: 0,
    },
    {
      id: 6,
      name: 'Fajar Nugroho',
      division: 'Teknik',
      shift: 'Pagi',
      checkIn: '06:07',
      checkOut: '14:10',
      status: 'Hadir',
      late: 0,
    },
    {
      id: 7,
      name: 'Rio Saputra',
      division: 'QC',
      shift: 'Siang',
      checkIn: '14:09',
      checkOut: '-',
      status: 'Terlambat',
      late: 9,
    },
    {
      id: 8,
      name: 'Dewi Rahayu',
      division: 'Admin',
      shift: 'Pagi',
      checkIn: '-',
      checkOut: '-',
      status: 'Izin',
      late: 0,
    },
    {
      id: 9,
      name: 'Siti Aminah',
      division: 'Produksi',
      shift: 'Malam',
      checkIn: '-',
      checkOut: '-',
      status: 'Alpha',
      late: 0,
    },
    {
      id: 10,
      name: 'Joko Widodo',
      division: 'Teknik',
      shift: 'Pagi',
      checkIn: '06:10',
      checkOut: '14:12',
      status: 'Hadir',
      late: 0,
    },
    {
      id: 11,
      name: 'Hendra Gunawan',
      division: 'Produksi',
      shift: 'Siang',
      checkIn: '14:02',
      checkOut: '-',
      status: 'Hadir',
      late: 0,
    },
    {
      id: 12,
      name: 'Putri Lestari',
      division: 'Admin',
      shift: 'Pagi',
      checkIn: '06:15',
      checkOut: '14:17',
      status: 'Hadir',
      late: 0,
    },
    {
      id: 13,
      name: 'Wahyu Setiawan',
      division: 'Gudang',
      shift: 'Malam',
      checkIn: '-',
      checkOut: '-',
      status: 'Izin',
      late: 0,
    },
    {
      id: 14,
      name: 'Agus Budiman',
      division: 'Produksi',
      shift: 'Pagi',
      checkIn: '06:22',
      checkOut: '14:24',
      status: 'Terlambat',
      late: 12,
    },
    {
      id: 15,
      name: 'Linda Sari',
      division: 'QC',
      shift: 'Siang',
      checkIn: '14:01',
      checkOut: '-',
      status: 'Hadir',
      late: 0,
    },
  ],
}
// ── END DUMMY DATA ───────────────────────────────────────────

const normalize = (val) => String(val ?? '').toLowerCase()

export function useMonitorAbsensi() {
  // ── Tanggal ──
  const today = new Date().toISOString().split('T')[0]
  const selectedDate = ref(today)

  // ── UI State ──
  const loading = ref(true)
  const error = ref(null)
  const lastUpdated = ref('—')

  // ── Filter ──
  const searchQuery = ref('')
  const filterShift = ref('Semua')
  const filterStatus = ref('Semua')
  const shifts = ['Semua', 'Pagi', 'Siang', 'Malam']
  const statuses = ['Semua', 'Hadir', 'Terlambat', 'Izin', 'Alpha']

  // ── Debounce search ──
  const debouncedSearch = ref('')
  let debounceTimer = null
  watch(searchQuery, (val) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedSearch.value = val
    }, DEBOUNCE_MS)
  })

  // ── Sorting ──
  const sortKey = ref('name')
  const sortDir = ref('asc') // 'asc' | 'desc'

  const currentPage = ref(1)

  const setSort = (key) => {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = 'asc'
    }
    currentPage.value = 1
  }

  // ── Data ──
  const stats = ref([])
  const shiftData = ref([])
  const summary = ref({ totalPegawai: 0, tingkatKehadiran: '0%', shiftAktif: 0 })
  const logs = ref([])

  // ── Computed: active filter count ──
  const activeFilterCount = computed(() => {
    let count = 0
    if (normalize(debouncedSearch.value)) count++
    if (filterShift.value !== 'Semua') count++
    if (filterStatus.value !== 'Semua') count++
    return count
  })

  // ── Actions: reset filters ──
  const resetFilters = () => {
    searchQuery.value = ''
    debouncedSearch.value = ''
    filterShift.value = 'Semua'
    filterStatus.value = 'Semua'
    currentPage.value = 1
  }

  // ── Computed: filtered + sorted ──
  const filtered = computed(() => {
    const q = normalize(debouncedSearch.value)

    let result = logs.value.filter((e) => {
      const matchSearch = !q || normalize(e.name).includes(q) || normalize(e.division).includes(q)
      const matchShift = filterShift.value === 'Semua' || e.shift === filterShift.value
      const matchStatus = filterStatus.value === 'Semua' || e.status === filterStatus.value
      return matchSearch && matchShift && matchStatus
    })

    result = [...result].sort((a, b) => {
      const valA = a[sortKey.value]
      const valB = b[sortKey.value]

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir.value === 'asc' ? valA - valB : valB - valA
      }

      const strA = normalize(valA)
      const strB = normalize(valB)

      if (strA < strB) return sortDir.value === 'asc' ? -1 : 1
      if (strA > strB) return sortDir.value === 'asc' ? 1 : -1
      return 0
    })

    return result
  })

  // ── Pagination ──
  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

  const paginated = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filtered.value.slice(start, start + PAGE_SIZE)
  })

  const pageNumbers = computed(() => {
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const pages = new Set([1, total, current])
    if (current > 1) pages.add(current - 1)
    if (current < total) pages.add(current + 1)

    const sorted = Array.from(pages).sort((a, b) => a - b)

    const result = []
    let prev = 0
    for (const p of sorted) {
      if (p - prev > 1) result.push('...')
      result.push(p)
      prev = p
    }
    return result
  })

  // Reset halaman ketika filter/sort berubah
  watch([debouncedSearch, filterShift, filterStatus, sortKey, sortDir], () => {
    currentPage.value = 1
  })

  // ── Export CSV ──
  const exportCSV = () => {
    const headers = ['ID', 'Nama', 'Divisi', 'Shift', 'Check In', 'Check Out', 'Status', 'Terlambat (mnt)']
    const rows = filtered.value.map((e) => [
      e.id,
      e.name,
      e.division,
      e.shift,
      e.checkIn,
      e.checkOut,
      e.status,
      e.late,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `absensi_${selectedDate.value}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  // ── Format timestamp ──
  const formatTime = (date) =>
    date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // ── Fetch data ──
  const fetchByDate = async (date) => {
    loading.value = true
    error.value = null

    try {
      // Jika backend sudah siap, aktifkan block ini:
      // const [statsData, shiftRes, summaryRes, logsData] = await Promise.all([
      //   getAbsensiStats(date),
      //   getShiftSummary(date),
      //   getAbsensiSummary(date),
      //   getAbsensiLogs(date),
      // ])
      // stats.value = statsData
      // shiftData.value = shiftRes
      // summary.value = summaryRes
      // logs.value = logsData

      // Dummy (sementara)
      await new Promise((r) => setTimeout(r, 500))
      stats.value = DUMMY.stats
      shiftData.value = DUMMY.shiftData
      summary.value = DUMMY.summary
      logs.value = DUMMY.logs

      lastUpdated.value = formatTime(new Date())
      currentPage.value = 1
    } catch (err) {
      console.error('Gagal memuat data absensi:', err)
      error.value = 'Gagal memuat data. Periksa koneksi atau hubungi backend.'
    } finally {
      loading.value = false
    }
  }

  watch(selectedDate, (newDate) => fetchByDate(newDate), { immediate: true })

  return {
    // Filter
    selectedDate,
    searchQuery,
    filterShift,
    filterStatus,
    shifts,
    statuses,

    // State
    loading,
    error,
    lastUpdated,
    stats,
    shiftData,
    summary,
    logs,

    // Sorting
    sortKey,
    sortDir,
    setSort,

    // Pagination
    currentPage,
    totalPages,
    paginated,
    pageNumbers,

    // Computed
    filtered,
    activeFilterCount,

    // Actions
    refetch: () => fetchByDate(selectedDate.value),
    resetFilters,
    exportCSV,
  }
}
