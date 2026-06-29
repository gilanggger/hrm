/**
 * ============================================================
 *  FILE: src/composables/usePenjadwalanShift.js
 *
 *  ✅ BACKEND: Set USE_MOCK = false dan pastikan endpoint
 *             /api/penjadwalan-shift sudah siap.
 *
 *  ✅ FRONTEND: Jangan ubah file ini.
 *              Semua tampilan ada di PenjadwalanShift.vue
 * ============================================================
 */

import { ref, computed, watch } from 'vue'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ── Set true = pakai data dummy, false = pakai API nyata ──
const USE_MOCK = true

// ── Definisi shift (statis, sinkron dengan backend) ───────
export const SHIFT_DEF = [
  { nama: 'Pagi',  jam: '06:00 – 14:00', warna: 'amber'  },
  { nama: 'Siang', jam: '14:00 – 22:00', warna: 'sky'    },
  { nama: 'Malam', jam: '22:00 – 06:00', warna: 'violet' },
  { nama: 'Libur', jam: '—',             warna: 'slate'  },
]

// ── 7 hari tampil (bisa di-navigate per minggu) ───────────
function getWeekDays(offsetWeek = 0) {
  const today = new Date()
  today.setDate(today.getDate() + offsetWeek * 7)
  // Senin minggu ini
  const mon = new Date(today)
  mon.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return {
      label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      tanggal: d.toISOString().slice(0, 10),
      isToday: d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10),
    }
  })
}

// ── Mock data jadwal ──────────────────────────────────────
const MOCK_PEGAWAI = [
  { id:1,  nama:'Andi Saputra',    divisi:'Produksi'     },
  { id:2,  nama:'Budi Santoso',    divisi:'QC'           },
  { id:3,  nama:'Rudi Hartono',    divisi:'Gudang'       },
  { id:4,  nama:'Fajar Nugroho',   divisi:'Teknik'       },
  { id:5,  nama:'Joko Widodo',     divisi:'Teknik'       },
  { id:6,  nama:'Siti Aminah',     divisi:'Produksi'     },
  { id:7,  nama:'Dewi Rahayu',     divisi:'Administrasi' },
  { id:8,  nama:'Hendra Kusuma',   divisi:'Produksi'     },
  { id:9,  nama:'Wahyu Pratama',   divisi:'Gudang'       },
  { id:10, nama:'Rizki Firmansyah',divisi:'QC'           },
  { id:11, nama:'Agus Salim',      divisi:'Produksi'     },
  { id:12, nama:'Nurul Hidayah',   divisi:'Administrasi' },
]

// Seed jadwal deterministik supaya konsisten
function seedShift(pegawaiId, dayIndex) {
  const pola = [
    ['Pagi','Pagi','Pagi','Pagi','Pagi','Libur','Libur'],
    ['Siang','Siang','Siang','Siang','Siang','Libur','Libur'],
    ['Malam','Malam','Malam','Malam','Malam','Libur','Libur'],
    ['Pagi','Siang','Pagi','Siang','Pagi','Libur','Libur'],
    ['Malam','Pagi','Malam','Pagi','Malam','Libur','Libur'],
  ]
  return pola[(pegawaiId - 1) % pola.length][dayIndex]
}

function buildMockJadwal(days) {
  return MOCK_PEGAWAI.map(p => ({
    ...p,
    jadwal: days.map((d, i) => ({
      tanggal: d.tanggal,
      shift: seedShift(p.id, i),
    })),
  }))
}

// ── Summary helper ────────────────────────────────────────
function buildSummary(jadwalList, days) {
  return days.map((d, di) => {
    const shifts = jadwalList.map(p => p.jadwal[di].shift)
    return {
      tanggal: d.tanggal,
      pagi:   shifts.filter(s => s === 'Pagi').length,
      siang:  shifts.filter(s => s === 'Siang').length,
      malam:  shifts.filter(s => s === 'Malam').length,
      libur:  shifts.filter(s => s === 'Libur').length,
    }
  })
}

// ══════════════════════════════════════════════════════════
export function usePenjadwalanShift() {
  const loading     = ref(false)
  const error       = ref(null)
  const weekOffset  = ref(0)           // 0 = minggu ini, -1 = kemarin, +1 = depan
  const days        = ref([])
  const jadwalList  = ref([])          // [{id, nama, divisi, jadwal:[{tanggal,shift}]}]
  const summary     = ref([])          // per-hari count
  const editMode    = ref(false)
  const saveLoading = ref(false)

  // Filter
  const filterDivisi = ref('')
  const filterSearch = ref('')

  const DIVISI_LIST = [...new Set(MOCK_PEGAWAI.map(p => p.divisi))].sort()

  // ── Computed: pegawai yang ditampilkan setelah filter ──
  const filteredList = computed(() => {
    return jadwalList.value.filter(p => {
      if (filterDivisi.value && p.divisi !== filterDivisi.value) return false
      if (filterSearch.value && !p.nama.toLowerCase().includes(filterSearch.value.toLowerCase())) return false
      return true
    })
  })

  // ── Navigasi minggu ────────────────────────────────────
  function prevWeek() { weekOffset.value-- }
  function nextWeek() { weekOffset.value++ }
  function goToday()  { weekOffset.value = 0 }

  watch(weekOffset, () => fetchJadwal())

  // ── Fetch / mock ───────────────────────────────────────
  async function fetchJadwal() {
    loading.value = true
    error.value   = null

    days.value = getWeekDays(weekOffset.value)

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      jadwalList.value = buildMockJadwal(days.value)
      summary.value    = buildSummary(jadwalList.value, days.value)
      loading.value    = false
      return
    }

    try {
      const monday = days.value[0].tanggal
      const res    = await fetch(`${BASE_URL}/api/penjadwalan-shift?week=${monday}`)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      /**
       * Backend wajib mengembalikan:
       * {
       *   jadwal: [
       *     {
       *       id: number, nama: string, divisi: string,
       *       jadwal: [ { tanggal: "YYYY-MM-DD", shift: "Pagi"|"Siang"|"Malam"|"Libur" } ]
       *     }
       *   ],
       *   summary: [ { tanggal, pagi, siang, malam, libur } ]
       * }
       */
      jadwalList.value = data.jadwal  ?? []
      summary.value    = data.summary ?? []
    } catch (e) {
      error.value = e.message ?? 'Gagal memuat jadwal'
    } finally {
      loading.value = false
    }
  }

  // ── Edit shift satu cell ───────────────────────────────
  function setShift(pegawaiId, tanggal, shiftBaru) {
    const p = jadwalList.value.find(x => x.id === pegawaiId)
    if (!p) return
    const cell = p.jadwal.find(j => j.tanggal === tanggal)
    if (cell) cell.shift = shiftBaru
    // Rebuild summary
    summary.value = buildSummary(jadwalList.value, days.value)
  }

  // ── Simpan perubahan ───────────────────────────────────
  async function saveJadwal() {
    if (USE_MOCK) {
      saveLoading.value = true
      await new Promise(r => setTimeout(r, 600))
      saveLoading.value = false
      editMode.value    = false
      alert('Jadwal berhasil disimpan! (mock)')
      return
    }
    saveLoading.value = true
    try {
      const payload = jadwalList.value.map(p => ({
        pegawaiId: p.id,
        jadwal:    p.jadwal,
      }))
      const res = await fetch(`${BASE_URL}/api/penjadwalan-shift`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ jadwal: payload }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan jadwal')
      editMode.value = false
    } catch (e) {
      alert('Simpan gagal: ' + e.message)
    } finally {
      saveLoading.value = false
    }
  }

  const weekLabel = computed(() => {
    if (!days.value.length) return ''
    const d = days.value
    return `${d[0].tanggal} – ${d[6].tanggal}`
  })

  // Mount
  fetchJadwal()

  return {
    loading, error, saveLoading,
    days, jadwalList, filteredList, summary,
    weekOffset, weekLabel,
    editMode, filterDivisi, filterSearch,
    DIVISI_LIST, SHIFT_DEF,
    prevWeek, nextWeek, goToday,
    setShift, saveJadwal, fetchJadwal,
  }
}