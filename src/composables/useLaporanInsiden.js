/**
 * ============================================================
 *  FILE: src/composables/useLaporanInsiden.js
 *  TUJUAN: Logic & data untuk halaman Laporan Insiden K3.
 *
 *  ✅ UNTUK BACKEND:
 *  - Ganti fetchData() agar memanggil endpoint API asli
 *    (contoh: GET /api/k3/insiden?periode=YYYY-MM)
 *  - Ganti tutupInsiden() agar memanggil PATCH /api/k3/insiden/{id}
 * ============================================================
 */

import { ref, computed } from 'vue'

export function useLaporanInsiden() {
  const loading = ref(true)
  const error = ref(null)
  const updating = ref(null)

  const searchQuery = ref('')
  const filterTingkat = ref('Semua Tingkat')
  const filterStatus = ref('Semua Status')
  const tingkatList = ['Semua Tingkat', 'Ringan', 'Sedang', 'Berat']
  const statusList = ['Semua Status', 'Investigasi', 'Ditutup']

  const insiden = ref([])

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO(backend): fetch(`/api/k3/insiden?periode=...`)
      await new Promise((r) => setTimeout(r, 500))
      insiden.value = [
        { id: 1, tanggal: '28 Jun 2026', nama: 'Ahmad Rizki', divisi: 'Produksi', lokasi: 'Area Giling', jenis: 'Terpeleset', tingkat: 'Ringan', status: 'Ditutup' },
        { id: 2, tanggal: '25 Jun 2026', nama: 'Yoga Pratama', divisi: 'Gudang', lokasi: 'Gudang Bahan Baku', jenis: 'Tertimpa Barang', tingkat: 'Sedang', status: 'Investigasi' },
        { id: 3, tanggal: '20 Jun 2026', nama: 'Rio Saputra', divisi: 'QC', lokasi: 'Lab QC', jenis: 'Terpapar Bahan Kimia', tingkat: 'Berat', status: 'Investigasi' },
        { id: 4, tanggal: '15 Jun 2026', nama: 'Fajar Nugroho', divisi: 'Teknik', lokasi: 'Ruang Mesin', jenis: 'Luka Tersayat', tingkat: 'Ringan', status: 'Ditutup' },
        { id: 5, tanggal: '10 Jun 2026', nama: 'Rudi Hartono', divisi: 'Gudang', lokasi: 'Area Bongkar Muat', jenis: 'Kecelakaan Forklift', tingkat: 'Berat', status: 'Investigasi' },
        { id: 6, tanggal: '05 Jun 2026', nama: 'Budi Santoso', divisi: 'QC', lokasi: 'Lab QC', jenis: 'Iritasi Pernapasan', tingkat: 'Sedang', status: 'Ditutup' },
      ]
    } catch (e) {
      error.value = 'Gagal memuat data laporan insiden. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const filtered = computed(() => {
    return insiden.value.filter((i) => {
      const matchSearch = i.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
        || i.jenis.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchTingkat = filterTingkat.value === 'Semua Tingkat' || i.tingkat === filterTingkat.value
      const matchStatus = filterStatus.value === 'Semua Status' || i.status === filterStatus.value
      return matchSearch && matchTingkat && matchStatus
    })
  })

  const stats = computed(() => {
    const total = insiden.value.length
    const berat = insiden.value.filter((i) => i.tingkat === 'Berat').length
    const ringan = insiden.value.filter((i) => i.tingkat === 'Ringan').length
    const ditutup = insiden.value.filter((i) => i.status === 'Ditutup').length
    return [
      { title: 'Total Insiden', value: total },
      { title: 'Insiden Berat', value: berat },
      { title: 'Insiden Ringan', value: ringan },
      { title: 'Sudah Ditutup', value: ditutup },
    ]
  })

  const tutupInsiden = async (item) => {
    // TODO(backend): PATCH /api/k3/insiden/{item.id} { status: 'Ditutup' }
    updating.value = item.id
    await new Promise((r) => setTimeout(r, 500))
    item.status = 'Ditutup'
    updating.value = null
  }

  return {
    loading, error, updating,
    searchQuery, filterTingkat, filterStatus, tingkatList, statusList,
    stats, filtered,
    tutupInsiden,
    refetch: fetchData,
  }
}