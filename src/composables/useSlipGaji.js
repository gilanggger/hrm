/**
 * ============================================================
 *  FILE: src/composables/useSlipGaji.js
 *  TUJUAN: Logic & data untuk halaman Slip Gaji.
 *
 *  ✅ UNTUK BACKEND:
 *  - Ganti fetchData() agar memanggil endpoint API asli
 *    (contoh: GET /api/payroll/slip?periode=YYYY-MM)
 *  - Ganti unduhSlip() agar memanggil GET /api/payroll/slip/{id}/pdf
 * ============================================================
 */

import { ref, computed } from 'vue'

export function useSlipGaji() {
  const loading = ref(true)
  const error = ref(null)
  const downloading = ref(null)

  const periode = ref('Juli 2026')
  const searchQuery = ref('')

  const slip = ref([])

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO(backend): fetch(`/api/payroll/slip?periode=${periode.value}`)
      await new Promise((r) => setTimeout(r, 500))
      slip.value = [
        { id: 1, name: 'Andi Saputra', division: 'Produksi', gajiBersih: 4700000, status: 'Diunduh' },
        { id: 2, name: 'Budi Santoso', division: 'QC', gajiBersih: 5100000, status: 'Diunduh' },
        { id: 3, name: 'Rudi Hartono', division: 'Gudang', gajiBersih: 4300000, status: 'Belum Diunduh' },
        { id: 4, name: 'Fajar Nugroho', division: 'Teknik', gajiBersih: 5430000, status: 'Belum Diunduh' },
        { id: 5, name: 'Ahmad Rizki', division: 'Produksi', gajiBersih: 4620000, status: 'Diunduh' },
        { id: 6, name: 'Yoga Pratama', division: 'Gudang', gajiBersih: 4460000, status: 'Belum Diunduh' },
        { id: 7, name: 'Rio Saputra', division: 'QC', gajiBersih: 5020000, status: 'Diunduh' },
        { id: 8, name: 'Dewi Lestari', division: 'HRD', gajiBersih: 5840000, status: 'Belum Diunduh' },
      ]
    } catch (e) {
      error.value = 'Gagal memuat data slip gaji. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const filtered = computed(() => {
    return slip.value.filter((p) => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  })

  const stats = computed(() => {
    const total = slip.value.length
    const diunduh = slip.value.filter((p) => p.status === 'Diunduh').length
    const belum = total - diunduh
    return [
      { title: 'Slip Terbit', value: total },
      { title: 'Sudah Diunduh', value: diunduh },
      { title: 'Belum Diunduh', value: belum },
      { title: 'Periode Aktif', value: periode.value },
    ]
  })

  const unduhSlip = async (item) => {
    // TODO(backend): window.open(`/api/payroll/slip/${item.id}/pdf`, '_blank')
    downloading.value = item.id
    await new Promise((r) => setTimeout(r, 500))
    item.status = 'Diunduh'
    downloading.value = null
  }

  return {
    loading, error, downloading,
    periode, searchQuery,
    stats, filtered,
    unduhSlip,
    refetch: fetchData,
  }
}