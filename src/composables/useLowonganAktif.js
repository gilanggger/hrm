/**
 * ============================================================
 *  FILE: src/composables/useLowonganAktif.js
 *  TUJUAN: Logic & data untuk halaman Lowongan Aktif rekrutmen.
 *
 *  ✅ UNTUK BACKEND:
 *  - Ganti fetchData() agar memanggil endpoint API asli
 *    (contoh: GET /api/rekrutmen/lowongan)
 *  - Ganti tutupLowongan() agar memanggil PATCH /api/rekrutmen/lowongan/{id}
 *  - Ganti tambahLowongan() agar memanggil POST /api/rekrutmen/lowongan
 * ============================================================
 */

import { ref, computed } from 'vue'

export function useLowonganAktif() {
  const loading = ref(true)
  const error = ref(null)
  const updating = ref(null)

  const searchQuery = ref('')
  const filterStatus = ref('Semua Status')
  const statusList = ['Semua Status', 'Aktif', 'Ditutup']

  const lowongan = ref([])

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO(backend): fetch('/api/rekrutmen/lowongan')
      await new Promise((r) => setTimeout(r, 500))
      lowongan.value = [
        { id: 1, posisi: 'Operator Produksi', divisi: 'Produksi', pelamar: 42, deadline: '15 Jul 2026', status: 'Aktif' },
        { id: 2, posisi: 'Staff QC', divisi: 'QC', pelamar: 18, deadline: '10 Jul 2026', status: 'Aktif' },
        { id: 3, posisi: 'Teknisi Mesin', divisi: 'Teknik', pelamar: 27, deadline: '20 Jul 2026', status: 'Aktif' },
        { id: 4, posisi: 'Staff Gudang', divisi: 'Gudang', pelamar: 35, deadline: '05 Jul 2026', status: 'Aktif' },
        { id: 5, posisi: 'HR Recruiter', divisi: 'HRD', pelamar: 9, deadline: '30 Jun 2026', status: 'Ditutup' },
        { id: 6, posisi: 'Admin Payroll', divisi: 'Keuangan', pelamar: 14, deadline: '25 Jun 2026', status: 'Ditutup' },
      ]
    } catch (e) {
      error.value = 'Gagal memuat data lowongan. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const filtered = computed(() => {
    return lowongan.value.filter((l) => {
      const matchSearch = l.posisi.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchStatus = filterStatus.value === 'Semua Status' || l.status === filterStatus.value
      return matchSearch && matchStatus
    })
  })

  const stats = computed(() => {
    const total = lowongan.value.length
    const aktif = lowongan.value.filter((l) => l.status === 'Aktif').length
    const totalPelamar = lowongan.value.reduce((s, l) => s + l.pelamar, 0)
    const mendesak = lowongan.value.filter((l) => l.status === 'Aktif' && l.pelamar < 20).length
    return [
      { title: 'Total Lowongan', value: total },
      { title: 'Lowongan Aktif', value: aktif },
      { title: 'Total Pelamar', value: totalPelamar },
      { title: 'Perlu Dipromosikan', value: mendesak },
    ]
  })

  const tutupLowongan = async (item) => {
    // TODO(backend): PATCH /api/rekrutmen/lowongan/{item.id} { status: 'Ditutup' }
    updating.value = item.id
    await new Promise((r) => setTimeout(r, 500))
    item.status = 'Ditutup'
    updating.value = null
  }

  return {
    loading, error, updating,
    searchQuery, filterStatus, statusList,
    stats, filtered,
    tutupLowongan,
    refetch: fetchData,
  }
}