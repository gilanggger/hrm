/**
 * ============================================================
 *  FILE: src/composables/useUpahHarian.js
 *  TUJUAN: Logic & data untuk halaman Upah Harian (pekerja
 *  harian lepas / musiman pabrik gula).
 *
 *  ✅ UNTUK BACKEND:
 *  - Ganti fetchData() agar memanggil endpoint API asli
 *    (contoh: GET /api/payroll/upah-harian?periode=YYYY-MM)
 *  - Ganti bayarUpah() agar memanggil POST /api/payroll/bayar
 * ============================================================
 */

import { ref, computed } from 'vue'

export function useUpahHarian() {
  const loading = ref(true)
  const error = ref(null)
  const paying = ref(null)

  const searchQuery = ref('')
  const filterStatus = ref('Semua Status')
  const statuses = ['Semua Status', 'Sudah Dibayar', 'Belum Dibayar']

  const pekerja = ref([])

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO(backend): fetch(`/api/payroll/upah-harian?periode=...`)
      await new Promise((r) => setTimeout(r, 500))
      pekerja.value = [
        { id: 1, name: 'Slamet Riyadi', division: 'Giling Tebu', hariKerja: 24, upahPerHari: 95000, status: 'Sudah Dibayar' },
        { id: 2, name: 'Warsito', division: 'Angkut Tebu', hariKerja: 22, upahPerHari: 90000, status: 'Sudah Dibayar' },
        { id: 3, name: 'Bambang Tri', division: 'Giling Tebu', hariKerja: 20, upahPerHari: 95000, status: 'Belum Dibayar' },
        { id: 4, name: 'Joko Susilo', division: 'Gudang Musiman', hariKerja: 18, upahPerHari: 85000, status: 'Belum Dibayar' },
        { id: 5, name: 'Eko Prasetyo', division: 'Angkut Tebu', hariKerja: 23, upahPerHari: 90000, status: 'Sudah Dibayar' },
        { id: 6, name: 'Hendra Gunawan', division: 'Giling Tebu', hariKerja: 21, upahPerHari: 95000, status: 'Belum Dibayar' },
        { id: 7, name: 'Sutrisno', division: 'Gudang Musiman', hariKerja: 19, upahPerHari: 85000, status: 'Belum Dibayar' },
      ]
    } catch (e) {
      error.value = 'Gagal memuat data upah harian. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const totalUpah = (item) => item.hariKerja * item.upahPerHari

  const filtered = computed(() => {
    return pekerja.value.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchStatus = filterStatus.value === 'Semua Status' || p.status === filterStatus.value
      return matchSearch && matchStatus
    })
  })

  const stats = computed(() => {
    const total = pekerja.value.length
    const totalHari = pekerja.value.reduce((s, p) => s + p.hariKerja, 0)
    const totalDibayarkan = pekerja.value
      .filter((p) => p.status === 'Sudah Dibayar')
      .reduce((s, p) => s + totalUpah(p), 0)
    const rataRata = total ? Math.round(pekerja.value.reduce((s, p) => s + p.upahPerHari, 0) / total) : 0
    return [
      { title: 'Pekerja Harian', value: total },
      { title: 'Total Hari Kerja', value: totalHari },
      { title: 'Upah Dibayarkan', value: `Rp ${(totalDibayarkan / 1000000).toFixed(1)}Jt` },
      { title: 'Rata-rata / Hari', value: `Rp ${(rataRata / 1000).toFixed(0)}rb` },
    ]
  })

  const bayarUpah = async (item) => {
    // TODO(backend): POST /api/payroll/bayar/{item.id}
    paying.value = item.id
    await new Promise((r) => setTimeout(r, 600))
    item.status = 'Sudah Dibayar'
    paying.value = null
  }

  return {
    loading, error, paying,
    searchQuery, filterStatus, statuses,
    stats, filtered, totalUpah,
    bayarUpah,
    refetch: fetchData,
  }
}