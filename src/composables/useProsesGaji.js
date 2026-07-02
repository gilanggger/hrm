/**
 * ============================================================
 *  FILE: src/composables/useProsesGaji.js
 *  TUJUAN: Logic & data untuk halaman Proses Gaji.
 *
 *  ✅ UNTUK BACKEND:
 *  - Ganti fungsi fetchData() agar memanggil endpoint API asli
 *    (contoh: GET /api/payroll/proses?periode=YYYY-MM)
 *  - Ganti fungsi prosesGaji() & prosesSemua() agar memanggil
 *    endpoint POST /api/payroll/proses
 *  - Struktur data (shape) tolong dipertahankan agar tampilan
 *    di ProsesGaji.vue tidak perlu diubah
 * ============================================================
 */

import { ref, computed } from 'vue'

export function useProsesGaji() {
  const loading = ref(true)
  const error = ref(null)
  const processing = ref(null) // id pegawai yang sedang diproses

  const periode = ref('Juli 2026')
  const searchQuery = ref('')
  const filterStatus = ref('Semua Status')
  const statuses = ['Semua Status', 'Diproses', 'Menunggu']

  const pegawai = ref([])

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO(backend): fetch(`/api/payroll/proses?periode=${periode.value}`)
      await new Promise((r) => setTimeout(r, 500))
      pegawai.value = [
        { id: 1, name: 'Andi Saputra', division: 'Produksi', gajiPokok: 4200000, tunjangan: 650000, potongan: 150000, status: 'Diproses' },
        { id: 2, name: 'Budi Santoso', division: 'QC', gajiPokok: 4500000, tunjangan: 700000, potongan: 100000, status: 'Diproses' },
        { id: 3, name: 'Rudi Hartono', division: 'Gudang', gajiPokok: 4000000, tunjangan: 500000, potongan: 200000, status: 'Menunggu' },
        { id: 4, name: 'Fajar Nugroho', division: 'Teknik', gajiPokok: 4800000, tunjangan: 750000, potongan: 120000, status: 'Menunggu' },
        { id: 5, name: 'Ahmad Rizki', division: 'Produksi', gajiPokok: 4200000, tunjangan: 600000, potongan: 180000, status: 'Diproses' },
        { id: 6, name: 'Yoga Pratama', division: 'Gudang', gajiPokok: 4000000, tunjangan: 550000, potongan: 90000, status: 'Menunggu' },
        { id: 7, name: 'Rio Saputra', division: 'QC', gajiPokok: 4500000, tunjangan: 650000, potongan: 130000, status: 'Menunggu' },
        { id: 8, name: 'Dewi Lestari', division: 'HRD', gajiPokok: 5200000, tunjangan: 800000, potongan: 160000, status: 'Diproses' },
      ]
    } catch (e) {
      error.value = 'Gagal memuat data proses gaji. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const totalGaji = (item) => item.gajiPokok + item.tunjangan - item.potongan

  const filtered = computed(() => {
    return pegawai.value.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchStatus = filterStatus.value === 'Semua Status' || p.status === filterStatus.value
      return matchSearch && matchStatus
    })
  })

  const stats = computed(() => {
    const total = pegawai.value.length
    const diproses = pegawai.value.filter((p) => p.status === 'Diproses').length
    const menunggu = total - diproses
    const totalAnggaran = pegawai.value.reduce((sum, p) => sum + totalGaji(p), 0)
    return [
      { title: 'Total Pegawai', value: total },
      { title: 'Sudah Diproses', value: diproses },
      { title: 'Menunggu Proses', value: menunggu },
      { title: 'Total Anggaran', value: `Rp ${(totalAnggaran / 1000000).toFixed(1)}Jt` },
    ]
  })

  const prosesGaji = async (item) => {
    // TODO(backend): POST /api/payroll/proses/{item.id}
    processing.value = item.id
    await new Promise((r) => setTimeout(r, 600))
    item.status = 'Diproses'
    processing.value = null
  }

  const prosesSemua = async () => {
    // TODO(backend): POST /api/payroll/proses-semua?periode=periode.value
    const pending = pegawai.value.filter((p) => p.status === 'Menunggu')
    for (const p of pending) {
      processing.value = p.id
      await new Promise((r) => setTimeout(r, 300))
      p.status = 'Diproses'
    }
    processing.value = null
  }

  return {
    loading, error, processing,
    periode, searchQuery, filterStatus, statuses,
    stats, filtered, totalGaji,
    prosesGaji, prosesSemua,
    refetch: fetchData,
  }
}