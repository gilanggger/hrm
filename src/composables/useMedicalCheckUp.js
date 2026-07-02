/**
 * ============================================================
 *  FILE: src/composables/useMedicalCheckUp.js
 *  TUJUAN: Logic & data untuk halaman Medical Check Up (MCU) pegawai.
 *
 *  ✅ UNTUK BACKEND:
 *  - Ganti fetchData() agar memanggil endpoint API asli
 *    (contoh: GET /api/k3/mcu?periode=YYYY-MM)
 *  - Ganti jadwalkanMcu() agar memanggil POST /api/k3/mcu/jadwal
 * ============================================================
 */

import { ref, computed } from 'vue'

export function useMedicalCheckUp() {
  const loading = ref(true)
  const error = ref(null)
  const scheduling = ref(null)

  const searchQuery = ref('')
  const filterHasil = ref('Semua Hasil')
  const hasilList = ['Semua Hasil', 'Sehat', 'Perlu Perhatian', 'Tidak Fit', 'Belum MCU']

  const pegawai = ref([])

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO(backend): fetch(`/api/k3/mcu?periode=...`)
      await new Promise((r) => setTimeout(r, 500))
      pegawai.value = [
        { id: 1, name: 'Andi Saputra', division: 'Produksi', tanggal: '12 Jun 2026', hasil: 'Sehat' },
        { id: 2, name: 'Budi Santoso', division: 'QC', tanggal: '10 Jun 2026', hasil: 'Sehat' },
        { id: 3, name: 'Rudi Hartono', division: 'Gudang', tanggal: '08 Jun 2026', hasil: 'Perlu Perhatian' },
        { id: 4, name: 'Fajar Nugroho', division: 'Teknik', tanggal: '—', hasil: 'Belum MCU' },
        { id: 5, name: 'Ahmad Rizki', division: 'Produksi', tanggal: '15 Jun 2026', hasil: 'Sehat' },
        { id: 6, name: 'Yoga Pratama', division: 'Gudang', tanggal: '05 Jun 2026', hasil: 'Tidak Fit' },
        { id: 7, name: 'Rio Saputra', division: 'QC', tanggal: '—', hasil: 'Belum MCU' },
        { id: 8, name: 'Dewi Lestari', division: 'HRD', tanggal: '11 Jun 2026', hasil: 'Sehat' },
      ]
    } catch (e) {
      error.value = 'Gagal memuat data medical check up. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const filtered = computed(() => {
    return pegawai.value.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchHasil = filterHasil.value === 'Semua Hasil' || p.hasil === filterHasil.value
      return matchSearch && matchHasil
    })
  })

  const stats = computed(() => {
    const total = pegawai.value.length
    const sudah = pegawai.value.filter((p) => p.hasil !== 'Belum MCU').length
    const belum = total - sudah
    const tindakLanjut = pegawai.value.filter((p) => p.hasil === 'Perlu Perhatian' || p.hasil === 'Tidak Fit').length
    return [
      { title: 'Total Pegawai', value: total },
      { title: 'Sudah MCU', value: sudah },
      { title: 'Belum MCU', value: belum },
      { title: 'Perlu Tindak Lanjut', value: tindakLanjut },
    ]
  })

  const jadwalkanMcu = async (item) => {
    // TODO(backend): POST /api/k3/mcu/jadwal { pegawaiId: item.id }
    scheduling.value = item.id
    await new Promise((r) => setTimeout(r, 500))
    item.hasil = 'Sehat'
    item.tanggal = 'Terjadwal'
    scheduling.value = null
  }

  return {
    loading, error, scheduling,
    searchQuery, filterHasil, hasilList,
    stats, filtered,
    jadwalkanMcu,
    refetch: fetchData,
  }
}