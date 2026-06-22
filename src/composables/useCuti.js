/**
 * ============================================================
 *  FILE: src/composables/useCuti.js
 *
 *  ✅ BACKEND: Set USE_MOCK = false dan pastikan endpoint
 *             /api/pengajuan-cuti sudah siap.
 *
 *  ✅ FRONTEND: Jangan ubah file ini.
 *              Semua tampilan ada di Cuti.vue
 * ============================================================
 */

import { ref, computed } from 'vue'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ── Set true = pakai data dummy, false = pakai API nyata ──
const USE_MOCK = true

// ── Jenis cuti (statis, sinkron dengan backend) ───────────
export const JENIS_CUTI_DEF = [
  { nama: 'Cuti Tahunan',    warna: 'emerald', perluLampiran: false },
  { nama: 'Cuti Sakit',      warna: 'rose',    perluLampiran: true  },
  { nama: 'Cuti Melahirkan', warna: 'pink',    perluLampiran: true  },
  { nama: 'Cuti Menikah',    warna: 'violet',  perluLampiran: true  },
  { nama: 'Izin Lainnya',    warna: 'slate',   perluLampiran: false },
]

// ── Status pengajuan (statis, sinkron dengan backend) ─────
export const STATUS_DEF = [
  { nama: 'Menunggu',   warna: 'amber'   },
  { nama: 'Disetujui',  warna: 'emerald' },
  { nama: 'Ditolak',    warna: 'rose'    },
  { nama: 'Dibatalkan', warna: 'slate'   },
]

const JATAH_CUTI_TAHUNAN = 12 // hari/tahun, default semua pegawai

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

// ── Helper tanggal ──────────────────────────────────────────
function toISO(d) { return d.toISOString().slice(0, 10) }

function addDays(base, n) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

// Hitung jumlah hari kerja (exclude Sabtu & Minggu), inklusif tgl mulai & selesai
function hitungHariKerja(tglMulai, tglSelesai) {
  const start = new Date(tglMulai)
  const end   = new Date(tglSelesai)
  let total = 0
  const cur = new Date(start)
  while (cur <= end) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) total++
    cur.setDate(cur.getDate() + 1)
  }
  return total
}

// ── Seed pengajuan deterministik supaya konsisten ──────────
function buildMockPengajuan() {
  const today = new Date()
  const seed = [
    { pegawaiId: 1,  jenisCuti: 'Cuti Tahunan',    mulai: -20, lama: 3,  status: 'Disetujui',  alasan: 'Acara keluarga di luar kota' },
    { pegawaiId: 2,  jenisCuti: 'Cuti Sakit',      mulai: -10, lama: 2,  status: 'Disetujui',  alasan: 'Demam, surat dokter terlampir' },
    { pegawaiId: 3,  jenisCuti: 'Izin Lainnya',    mulai: -5,  lama: 1,  status: 'Ditolak',    alasan: 'Keperluan pribadi', catatan: 'Bertabrakan dengan jadwal produksi' },
    { pegawaiId: 4,  jenisCuti: 'Cuti Tahunan',    mulai: 2,   lama: 4,  status: 'Menunggu',   alasan: 'Liburan tahunan bersama keluarga' },
    { pegawaiId: 5,  jenisCuti: 'Cuti Tahunan',    mulai: 7,   lama: 2,  status: 'Menunggu',   alasan: 'Menghadiri pernikahan saudara' },
    { pegawaiId: 6,  jenisCuti: 'Cuti Melahirkan', mulai: 14,  lama: 30, status: 'Disetujui',  alasan: 'Cuti melahirkan anak pertama' },
    { pegawaiId: 7,  jenisCuti: 'Cuti Tahunan',    mulai: -30, lama: 2,  status: 'Disetujui',  alasan: 'Mudik' },
    { pegawaiId: 8,  jenisCuti: 'Cuti Sakit',      mulai: -2,  lama: 1,  status: 'Menunggu',   alasan: 'Sakit gigi, perlu kontrol' },
    { pegawaiId: 9,  jenisCuti: 'Izin Lainnya',    mulai: -15, lama: 1,  status: 'Dibatalkan', alasan: 'Urusan bank, dibatalkan karena sudah selesai online' },
    { pegawaiId: 10, jenisCuti: 'Cuti Menikah',    mulai: 21,  lama: 3,  status: 'Menunggu',   alasan: 'Menikah' },
    { pegawaiId: 11, jenisCuti: 'Cuti Tahunan',    mulai: -45, lama: 5,  status: 'Disetujui',  alasan: 'Liburan akhir tahun' },
    { pegawaiId: 12, jenisCuti: 'Cuti Tahunan',    mulai: 1,   lama: 1,  status: 'Menunggu',   alasan: 'Mengurus dokumen keluarga' },
  ]

  return seed.map((s, i) => {
    const tglMulai   = toISO(addDays(today, s.mulai))
    const tglSelesai = toISO(addDays(today, s.mulai + s.lama - 1))
    const pegawai    = MOCK_PEGAWAI.find(p => p.id === s.pegawaiId)
    return {
      id:              i + 1,
      pegawaiId:       s.pegawaiId,
      nama:            pegawai?.nama  ?? '-',
      divisi:          pegawai?.divisi ?? '-',
      jenisCuti:       s.jenisCuti,
      tanggalMulai:    tglMulai,
      tanggalSelesai:  tglSelesai,
      jumlahHari:      hitungHariKerja(tglMulai, tglSelesai),
      alasan:          s.alasan,
      status:          s.status,
      tanggalDiajukan: toISO(addDays(today, s.mulai - 3)),
      disetujuiOleh:   s.status === 'Disetujui' ? 'HRD - Maria Susanti' : null,
      catatan:         s.catatan ?? null,
      lampiran:        JENIS_CUTI_DEF.find(j => j.nama === s.jenisCuti)?.perluLampiran ? 'surat-pendukung.pdf' : null,
    }
  })
}

// ── Summary helper ────────────────────────────────────────
function buildSummary(list) {
  return {
    menunggu:           list.filter(p => p.status === 'Menunggu').length,
    disetujui:          list.filter(p => p.status === 'Disetujui').length,
    ditolak:            list.filter(p => p.status === 'Ditolak').length,
    dibatalkan:         list.filter(p => p.status === 'Dibatalkan').length,
    totalHariDisetujui: list
      .filter(p => p.status === 'Disetujui')
      .reduce((acc, p) => acc + p.jumlahHari, 0),
  }
}

// Hitung sisa cuti tahunan tiap pegawai (hanya jenis "Cuti Tahunan" yang disetujui)
function buildSisaCuti(pengajuanList) {
  return MOCK_PEGAWAI.map(p => {
    const terpakai = pengajuanList
      .filter(x => x.pegawaiId === p.id && x.jenisCuti === 'Cuti Tahunan' && x.status === 'Disetujui')
      .reduce((acc, x) => acc + x.jumlahHari, 0)
    return {
      pegawaiId: p.id,
      nama:      p.nama,
      divisi:    p.divisi,
      jatah:     JATAH_CUTI_TAHUNAN,
      terpakai,
      sisa:      JATAH_CUTI_TAHUNAN - terpakai,
    }
  })
}

// ══════════════════════════════════════════════════════════
export function useCuti() {
  const loading       = ref(false)
  const error         = ref(null)
  const submitLoading = ref(false)
  const actionLoading = ref(false)   // approve / reject / cancel

  const pengajuanList = ref([])      // semua data pengajuan cuti
  const summary       = ref(null)    // ringkasan jumlah per status
  const sisaCutiList  = ref([])      // sisa jatah cuti tiap pegawai

  // Filter
  const filterStatus = ref('')
  const filterJenis  = ref('')
  const filterDivisi = ref('')
  const filterSearch = ref('')

  const DIVISI_LIST = [...new Set(MOCK_PEGAWAI.map(p => p.divisi))].sort()

  // ── Computed: list setelah difilter ────────────────────
  const filteredList = computed(() => {
    return pengajuanList.value.filter(p => {
      if (filterStatus.value && p.status !== filterStatus.value) return false
      if (filterJenis.value  && p.jenisCuti !== filterJenis.value) return false
      if (filterDivisi.value && p.divisi !== filterDivisi.value) return false
      if (filterSearch.value && !p.nama.toLowerCase().includes(filterSearch.value.toLowerCase())) return false
      return true
    })
  })

  // Diurutkan: Menunggu paling atas, lalu berdasarkan tanggal diajukan terbaru
  const sortedList = computed(() => {
    const urutanStatus = { Menunggu: 0, Disetujui: 1, Ditolak: 2, Dibatalkan: 3 }
    return [...filteredList.value].sort((a, b) => {
      if (urutanStatus[a.status] !== urutanStatus[b.status]) {
        return urutanStatus[a.status] - urutanStatus[b.status]
      }
      return new Date(b.tanggalDiajukan) - new Date(a.tanggalDiajukan)
    })
  })

  // ── Fetch / mock ───────────────────────────────────────
  async function fetchPengajuanCuti() {
    loading.value = true
    error.value   = null

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      pengajuanList.value = buildMockPengajuan()
      summary.value       = buildSummary(pengajuanList.value)
      sisaCutiList.value  = buildSisaCuti(pengajuanList.value)
      loading.value       = false
      return
    }

    try {
      const res = await fetch(`${BASE_URL}/api/pengajuan-cuti`)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      /**
       * Backend wajib mengembalikan:
       * {
       *   pengajuan: [
       *     {
       *       id, pegawaiId, nama, divisi,
       *       jenisCuti, tanggalMulai, tanggalSelesai, jumlahHari,
       *       alasan, status, tanggalDiajukan,
       *       disetujuiOleh, catatan, lampiran
       *     }
       *   ],
       *   summary: { menunggu, disetujui, ditolak, dibatalkan, totalHariDisetujui },
       *   sisaCuti: [ { pegawaiId, nama, divisi, jatah, terpakai, sisa } ]
       * }
       */
      pengajuanList.value = data.pengajuan ?? []
      summary.value       = data.summary   ?? null
      sisaCutiList.value  = data.sisaCuti  ?? []
    } catch (e) {
      error.value = e.message ?? 'Gagal memuat data pengajuan cuti'
    } finally {
      loading.value = false
    }
  }

  // ── Ajukan cuti baru ────────────────────────────────────
  async function ajukanCuti({ pegawaiId, jenisCuti, tanggalMulai, tanggalSelesai, alasan, lampiran = null }) {
    submitLoading.value = true
    error.value = null

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      const pegawai = MOCK_PEGAWAI.find(p => p.id === pegawaiId)
      const baru = {
        id:              Math.max(0, ...pengajuanList.value.map(p => p.id)) + 1,
        pegawaiId,
        nama:            pegawai?.nama  ?? '-',
        divisi:          pegawai?.divisi ?? '-',
        jenisCuti,
        tanggalMulai,
        tanggalSelesai,
        jumlahHari:      hitungHariKerja(tanggalMulai, tanggalSelesai),
        alasan,
        status:          'Menunggu',
        tanggalDiajukan: toISO(new Date()),
        disetujuiOleh:   null,
        catatan:         null,
        lampiran,
      }
      pengajuanList.value = [baru, ...pengajuanList.value]
      summary.value       = buildSummary(pengajuanList.value)
      sisaCutiList.value  = buildSisaCuti(pengajuanList.value)
      submitLoading.value = false
      alert('Pengajuan cuti berhasil dikirim! (mock)')
      return baru
    }

    try {
      const res = await fetch(`${BASE_URL}/api/pengajuan-cuti`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pegawaiId, jenisCuti, tanggalMulai, tanggalSelesai, alasan, lampiran }),
      })
      if (!res.ok) throw new Error('Gagal mengirim pengajuan cuti')
      const data = await res.json()
      await fetchPengajuanCuti()
      return data
    } catch (e) {
      error.value = e.message ?? 'Gagal mengirim pengajuan cuti'
      alert('Pengajuan gagal: ' + error.value)
    } finally {
      submitLoading.value = false
    }
  }

  // ── Setujui pengajuan ────────────────────────────────────
  async function setujuiPengajuan(id, catatan = '') {
    actionLoading.value = true

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      const p = pengajuanList.value.find(x => x.id === id)
      if (p) {
        p.status        = 'Disetujui'
        p.disetujuiOleh = 'HRD - Maria Susanti'
        p.catatan        = catatan || null
      }
      summary.value       = buildSummary(pengajuanList.value)
      sisaCutiList.value  = buildSisaCuti(pengajuanList.value)
      actionLoading.value = false
      return
    }

    try {
      const res = await fetch(`${BASE_URL}/api/pengajuan-cuti/${id}/setujui`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ catatan }),
      })
      if (!res.ok) throw new Error('Gagal menyetujui pengajuan')
      await fetchPengajuanCuti()
    } catch (e) {
      alert('Gagal menyetujui: ' + e.message)
    } finally {
      actionLoading.value = false
    }
  }

  // ── Tolak pengajuan ──────────────────────────────────────
  async function tolakPengajuan(id, alasanTolak) {
    actionLoading.value = true

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      const p = pengajuanList.value.find(x => x.id === id)
      if (p) {
        p.status  = 'Ditolak'
        p.catatan = alasanTolak
      }
      summary.value = buildSummary(pengajuanList.value)
      actionLoading.value = false
      return
    }

    try {
      const res = await fetch(`${BASE_URL}/api/pengajuan-cuti/${id}/tolak`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ alasan: alasanTolak }),
      })
      if (!res.ok) throw new Error('Gagal menolak pengajuan')
      await fetchPengajuanCuti()
    } catch (e) {
      alert('Gagal menolak: ' + e.message)
    } finally {
      actionLoading.value = false
    }
  }

  // ── Batalkan pengajuan (oleh pegawai sendiri, hanya jika masih Menunggu) ──
  async function batalkanPengajuan(id) {
    actionLoading.value = true

    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      const p = pengajuanList.value.find(x => x.id === id)
      if (p && p.status === 'Menunggu') p.status = 'Dibatalkan'
      summary.value = buildSummary(pengajuanList.value)
      actionLoading.value = false
      return
    }

    try {
      const res = await fetch(`${BASE_URL}/api/pengajuan-cuti/${id}/batalkan`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Gagal membatalkan pengajuan')
      await fetchPengajuanCuti()
    } catch (e) {
      alert('Gagal membatalkan: ' + e.message)
    } finally {
      actionLoading.value = false
    }
  }

  // ── Helper publik untuk form pengajuan (estimasi jumlah hari) ──
  function hitungEstimasiHari(tanggalMulai, tanggalSelesai) {
    if (!tanggalMulai || !tanggalSelesai) return 0
    return hitungHariKerja(tanggalMulai, tanggalSelesai)
  }

  // Mount
  fetchPengajuanCuti()

  return {
    loading, error, submitLoading, actionLoading,
    pengajuanList, filteredList, sortedList, summary, sisaCutiList,
    filterStatus, filterJenis, filterDivisi, filterSearch,
    DIVISI_LIST, JENIS_CUTI_DEF, STATUS_DEF,
    fetchPengajuanCuti, ajukanCuti, setujuiPengajuan, tolakPengajuan, batalkanPengajuan,
    hitungEstimasiHari,
  }
}