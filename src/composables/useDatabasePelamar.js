/**
 * ============================================================
 *  FILE: src/composables/useDatabasePelamar.js
 *  TUJUAN: Logic & data untuk halaman Database Pelamar rekrutmen.
 *
 *  ✅ UNTUK BACKEND:
 *  - Ganti fetchData() agar memanggil endpoint API asli
 *    (contoh: GET /api/rekrutmen/pelamar)
 *  - Ganti ubahTahap() agar memanggil PATCH /api/rekrutmen/pelamar/{id}
 * ============================================================
 */

import { ref, computed } from 'vue'

export function useDatabasePelamar() {
  const loading = ref(true)
  const error = ref(null)
  const updating = ref(null)

  const searchQuery = ref('')
  const filterTahap = ref('Semua Tahap')
  const tahapList = ['Semua Tahap', 'Screening', 'Interview', 'Diterima', 'Ditolak']

  const pelamar = ref([])

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO(backend): fetch('/api/rekrutmen/pelamar')
      await new Promise((r) => setTimeout(r, 500))
      pelamar.value = [
        { id: 1, nama: 'Dimas Prayoga', posisi: 'Operator Produksi', tanggal: '28 Jun 2026', tahap: 'Interview' },
        { id: 2, nama: 'Siti Nurhaliza', posisi: 'Staff QC', tanggal: '27 Jun 2026', tahap: 'Screening' },
        { id: 3, nama: 'Bagus Setiawan', posisi: 'Teknisi Mesin', tanggal: '25 Jun 2026', tahap: 'Diterima' },
        { id: 4, nama: 'Rina Wulandari', posisi: 'Staff Gudang', tanggal: '24 Jun 2026', tahap: 'Screening' },
        { id: 5, nama: 'Agus Kurniawan', posisi: 'Operator Produksi', tanggal: '22 Jun 2026', tahap: 'Ditolak' },
        { id: 6, nama: 'Putri Ayu', posisi: 'Staff QC', tanggal: '20 Jun 2026', tahap: 'Interview' },
        { id: 7, nama: 'Hendra Wijaya', posisi: 'Teknisi Mesin', tanggal: '18 Jun 2026', tahap: 'Diterima' },
        { id: 8, nama: 'Lestari Handayani', posisi: 'Staff Gudang', tanggal: '15 Jun 2026', tahap: 'Ditolak' },
      ]
    } catch (e) {
      error.value = 'Gagal memuat data pelamar. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const filtered = computed(() => {
    return pelamar.value.filter((p) => {
      const matchSearch = p.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
        || p.posisi.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchTahap = filterTahap.value === 'Semua Tahap' || p.tahap === filterTahap.value
      return matchSearch && matchTahap
    })
  })

  const stats = computed(() => {
    const total = pelamar.value.length
    const interview = pelamar.value.filter((p) => p.tahap === 'Interview').length
    const diterima = pelamar.value.filter((p) => p.tahap === 'Diterima').length
    const ditolak = pelamar.value.filter((p) => p.tahap === 'Ditolak').length
    return [
      { title: 'Total Pelamar', value: total },
      { title: 'Tahap Interview', value: interview },
      { title: 'Diterima', value: diterima },
      { title: 'Ditolak', value: ditolak },
    ]
  })

  const ubahTahap = async (item, tahapBaru) => {
    // TODO(backend): PATCH /api/rekrutmen/pelamar/{item.id} { tahap: tahapBaru }
    updating.value = item.id
    await new Promise((r) => setTimeout(r, 500))
    item.tahap = tahapBaru
    updating.value = null
  }

  return {
    loading, error, updating,
    searchQuery, filterTahap, tahapList,
    stats, filtered,
    ubahTahap,
    refetch: fetchData,
  }
}