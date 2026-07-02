/**
 * ============================================================
 *  FILE: src/composables/useInventarisAPD.js
 *  TUJUAN: Logic & data untuk halaman Inventaris APD
 *  (Alat Pelindung Diri).
 *
 *  ✅ UNTUK BACKEND:
 *  - Ganti fetchData() agar memanggil endpoint API asli
 *    (contoh: GET /api/k3/apd)
 *  - Ganti tambahStok() agar memanggil POST /api/k3/apd/{id}/stok
 * ============================================================
 */

import { ref, computed } from 'vue'

export function useInventarisAPD() {
  const loading = ref(true)
  const error = ref(null)
  const updating = ref(null)

  const searchQuery = ref('')
  const filterStatus = ref('Semua Status')
  const statusList = ['Semua Status', 'Aman', 'Menipis', 'Habis']

  const apd = ref([])

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO(backend): fetch('/api/k3/apd')
      await new Promise((r) => setTimeout(r, 500))
      apd.value = [
        { id: 1, nama: 'Helm Safety', kategori: 'Pelindung Kepala', stok: 85, minStok: 30, kadaluarsa: '—' },
        { id: 2, nama: 'Sarung Tangan Kimia', kategori: 'Pelindung Tangan', stok: 18, minStok: 25, kadaluarsa: 'Des 2026' },
        { id: 3, nama: 'Kacamata Safety', kategori: 'Pelindung Mata', stok: 42, minStok: 20, kadaluarsa: '—' },
        { id: 4, nama: 'Masker Respirator', kategori: 'Pelindung Pernapasan', stok: 6, minStok: 40, kadaluarsa: 'Sep 2026' },
        { id: 5, nama: 'Sepatu Safety', kategori: 'Pelindung Kaki', stok: 30, minStok: 20, kadaluarsa: '—' },
        { id: 6, nama: 'Rompi Reflektif', kategori: 'Pelindung Badan', stok: 0, minStok: 15, kadaluarsa: '—' },
        { id: 7, nama: 'Earplug', kategori: 'Pelindung Telinga', stok: 120, minStok: 50, kadaluarsa: 'Jan 2027' },
        { id: 8, nama: 'Sarung Tangan Kain', kategori: 'Pelindung Tangan', stok: 12, minStok: 30, kadaluarsa: '—' },
      ]
    } catch (e) {
      error.value = 'Gagal memuat data inventaris APD. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const statusStok = (item) => {
    if (item.stok === 0) return 'Habis'
    if (item.stok < item.minStok) return 'Menipis'
    return 'Aman'
  }

  const filtered = computed(() => {
    return apd.value.filter((a) => {
      const matchSearch = a.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchStatus = filterStatus.value === 'Semua Status' || statusStok(a) === filterStatus.value
      return matchSearch && matchStatus
    })
  })

  const stats = computed(() => {
    const totalJenis = apd.value.length
    const aman = apd.value.filter((a) => statusStok(a) === 'Aman').length
    const menipis = apd.value.filter((a) => statusStok(a) === 'Menipis').length
    const habis = apd.value.filter((a) => statusStok(a) === 'Habis').length
    return [
      { title: 'Jenis APD', value: totalJenis },
      { title: 'Stok Aman', value: aman },
      { title: 'Stok Menipis', value: menipis },
      { title: 'Stok Habis', value: habis },
    ]
  })

  const tambahStok = async (item, jumlah = 20) => {
    // TODO(backend): POST /api/k3/apd/{item.id}/stok { jumlah }
    updating.value = item.id
    await new Promise((r) => setTimeout(r, 500))
    item.stok += jumlah
    updating.value = null
  }

  return {
    loading, error, updating,
    searchQuery, filterStatus, statusList,
    stats, filtered, statusStok,
    tambahStok,
    refetch: fetchData,
  }
}