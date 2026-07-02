/**
 * ============================================================
 *  FILE: src/composables/useInsentif.js
 *  TUJUAN: Logic & data untuk halaman Insentif pegawai.
 *
 *  ✅ UNTUK BACKEND:
 *  - Ganti fetchData() agar memanggil endpoint API asli
 *    (contoh: GET /api/payroll/insentif?periode=YYYY-MM)
 *  - Ganti tambahInsentif() agar memanggil POST /api/payroll/insentif
 * ============================================================
 */

import { ref, computed } from 'vue'

export function useInsentif() {
  const loading = ref(true)
  const error = ref(null)

  const searchQuery = ref('')
  const filterJenis = ref('Semua Jenis')
  const jenisList = ['Semua Jenis', 'Produktivitas', 'Kehadiran', 'Lembur']

  const insentif = ref([])

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO(backend): fetch(`/api/payroll/insentif?periode=...`)
      await new Promise((r) => setTimeout(r, 500))
      insentif.value = [
        { id: 1, name: 'Andi Saputra', division: 'Produksi', jenis: 'Produktivitas', nominal: 450000, status: 'Terbayar' },
        { id: 2, name: 'Budi Santoso', division: 'QC', jenis: 'Kehadiran', nominal: 300000, status: 'Terbayar' },
        { id: 3, name: 'Rudi Hartono', division: 'Gudang', jenis: 'Lembur', nominal: 520000, status: 'Menunggu' },
        { id: 4, name: 'Fajar Nugroho', division: 'Teknik', jenis: 'Produktivitas', nominal: 480000, status: 'Terbayar' },
        { id: 5, name: 'Ahmad Rizki', division: 'Produksi', jenis: 'Kehadiran', nominal: 300000, status: 'Menunggu' },
        { id: 6, name: 'Yoga Pratama', division: 'Gudang', jenis: 'Lembur', nominal: 610000, status: 'Terbayar' },
        { id: 7, name: 'Dewi Lestari', division: 'HRD', jenis: 'Kehadiran', nominal: 300000, status: 'Terbayar' },
      ]
    } catch (e) {
      error.value = 'Gagal memuat data insentif. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const filtered = computed(() => {
    return insentif.value.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchJenis = filterJenis.value === 'Semua Jenis' || p.jenis === filterJenis.value
      return matchSearch && matchJenis
    })
  })

  const stats = computed(() => {
    const totalInsentif = insentif.value.reduce((s, p) => s + p.nominal, 0)
    const penerima = insentif.value.length
    const tertinggi = insentif.value.length ? Math.max(...insentif.value.map((p) => p.nominal)) : 0
    const kategoriAktif = new Set(insentif.value.map((p) => p.jenis)).size
    return [
      { title: 'Total Insentif', value: `Rp ${(totalInsentif / 1000000).toFixed(1)}Jt` },
      { title: 'Pegawai Penerima', value: penerima },
      { title: 'Insentif Tertinggi', value: `Rp ${(tertinggi / 1000).toFixed(0)}rb` },
      { title: 'Kategori Aktif', value: kategoriAktif },
    ]
  })

  // Ringkasan per jenis, dipakai untuk chart bar
  const chartBars = computed(() => {
    return jenisList.slice(1).map((jenis) => {
      const total = insentif.value.filter((p) => p.jenis === jenis).reduce((s, p) => s + p.nominal, 0)
      return { label: jenis, value: total }
    })
  })

  return {
    loading, error,
    searchQuery, filterJenis, jenisList,
    stats, filtered, chartBars,
    refetch: fetchData,
  }
}