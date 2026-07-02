/**
 * ============================================================
 *  FILE: src/composables/usePegawai.js
 * ============================================================
 *  Composable data untuk halaman:
 *    - PegawaiTetap.vue   -> usePegawai('tetap')
 *    - PegawaiMusiman.vue -> usePegawai('musiman')
 *
 *  Pola sama seperti composable lain di project ini:
 *  USE_MOCK = true untuk development, tinggal diganti ke
 *  pemanggilan API asli saat backend sudah siap.
 * ============================================================
 */

import { ref, computed, onMounted } from 'vue'

const USE_MOCK = true

/* ============================================================
   MOCK DATA GENERATOR
============================================================ */
const DIVISI_LIST = ['Produksi', 'QC', 'Gudang', 'Teknik', 'Administrasi', 'Keamanan']
const JABATAN_LIST = ['Operator', 'Staff', 'Supervisor', 'Teknisi', 'Admin', 'Kepala Regu']

function buatPegawaiTetap() {
  const nama = [
    'Andi Saputra', 'Budi Santoso', 'Rudi Hartono', 'Fajar Nugroho', 'Joko Widodo',
    'Siti Aminah', 'Dewi Lestari', 'Bambang Kusuma', 'Agus Salim', 'Hendra Wijaya',
    'Tono Sucipto', 'Yuni Astuti', 'Slamet Riyadi', 'Wahyu Nugraha', 'Eko Prasetyo',
  ]
  return nama.map((n, i) => {
    const masuk = new Date(2015 + (i % 9), i % 12, (i % 27) + 1)
    const masaKerjaTahun = 2026 - masuk.getFullYear()
    const statusPool = ['Aktif', 'Aktif', 'Aktif', 'Cuti', 'Nonaktif']
    return {
      id: i + 1,
      nik: `10${String(i + 1).padStart(3, '0')}`,
      nama: n,
      divisi: DIVISI_LIST[i % DIVISI_LIST.length],
      jabatan: JABATAN_LIST[i % JABATAN_LIST.length],
      tanggalMasuk: masuk.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      masaKerja: `${masaKerjaTahun} thn`,
      pendidikan: ['SMA/SMK', 'D3', 'S1'][i % 3],
      noHp: `08${(1000000000 + i * 137).toString().slice(0, 10)}`,
      status: statusPool[i % statusPool.length],
    }
  })
}

function buatPegawaiMusiman() {
  const nama = [
    'Wahyudi Saputra', 'Ratna Sari', 'Gunawan Putra', 'Indra Permana', 'Sari Wulandari',
    'Dedi Kurniawan', 'Lina Marlina', 'Yanto Setiawan', 'Rini Handayani', 'Sugeng Riyanto',
  ]
  return nama.map((n, i) => {
    const mulai = new Date(2026, 4, (i % 20) + 1)
    const selesai = new Date(2026, 8, (i % 25) + 1)
    const statusPool = ['Aktif', 'Aktif', 'Selesai Kontrak', 'Aktif']
    return {
      id: i + 1,
      nik: `MS${String(i + 1).padStart(3, '0')}`,
      nama: n,
      divisi: DIVISI_LIST[i % DIVISI_LIST.length],
      periodeGiling: 'Musim Giling 2026',
      tanggalMulai: mulai.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      tanggalSelesai: selesai.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      noHp: `08${(2000000000 + i * 91).toString().slice(0, 10)}`,
      status: statusPool[i % statusPool.length],
    }
  })
}

/* ============================================================
   COMPOSABLE
============================================================ */
export function usePegawai(tipe = 'tetap') {
  const loading = ref(true)
  const error = ref(null)

  const searchQuery = ref('')
  const filterDivisi = ref('Semua Divisi')
  const filterStatus = ref('Semua Status')

  const divisiOptions = ['Semua Divisi', ...DIVISI_LIST]
  const statusOptions = tipe === 'tetap'
    ? ['Semua Status', 'Aktif', 'Cuti', 'Nonaktif']
    : ['Semua Status', 'Aktif', 'Selesai Kontrak']

  const data = ref([])

  async function fetchData() {
    loading.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 350))
        data.value = tipe === 'tetap' ? buatPegawaiTetap() : buatPegawaiMusiman()
      } else {
        // TODO: ganti dengan pemanggilan API asli
        // const res = await api.get(`/pegawai?tipe=${tipe}`)
        // data.value = res.data
      }
    } catch (e) {
      error.value = 'Gagal memuat data pegawai. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchData)

  /* ── Statistik ── */
  const stats = computed(() => {
    const total = data.value.length
    if (tipe === 'tetap') {
      const aktif = data.value.filter((d) => d.status === 'Aktif').length
      const cuti = data.value.filter((d) => d.status === 'Cuti').length
      const nonaktif = data.value.filter((d) => d.status === 'Nonaktif').length
      return [
        { title: 'Total Pegawai Tetap', value: total },
        { title: 'Aktif', value: aktif },
        { title: 'Cuti', value: cuti },
        { title: 'Nonaktif', value: nonaktif },
      ]
    }
    const aktif = data.value.filter((d) => d.status === 'Aktif').length
    const selesai = data.value.filter((d) => d.status === 'Selesai Kontrak').length
    return [
      { title: 'Total Pegawai Musiman', value: total },
      { title: 'Masa Aktif', value: aktif },
      { title: 'Selesai Kontrak', value: selesai },
      { title: 'Musim Berjalan', value: total ? 1 : 0 },
    ]
  })

  /* ── Filter + Search ── */
  const filtered = computed(() => {
    return data.value.filter((d) => {
      const cocokSearch =
        d.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        d.nik.toLowerCase().includes(searchQuery.value.toLowerCase())
      const cocokDivisi = filterDivisi.value === 'Semua Divisi' || d.divisi === filterDivisi.value
      const cocokStatus = filterStatus.value === 'Semua Status' || d.status === filterStatus.value
      return cocokSearch && cocokDivisi && cocokStatus
    })
  })

  return {
    loading, error,
    searchQuery, filterDivisi, filterStatus,
    divisiOptions, statusOptions,
    stats, filtered,
    refetch: fetchData,
  }
}