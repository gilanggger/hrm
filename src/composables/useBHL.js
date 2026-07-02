/**
 * ============================================================
 *  FILE: src/composables/useBHL.js
 * ============================================================
 *  Composable data untuk halaman BHL.vue (Buruh Harian Lepas)
 * ============================================================
 */

import { ref, computed, onMounted } from 'vue'

const USE_MOCK = true

const DIVISI_LIST = ['Produksi', 'Gudang', 'Angkut Tebu', 'Kebersihan', 'Bongkar Muat']

function buatBHL() {
  const nama = [
    'Karto Wijoyo', 'Paino Sudarmo', 'Sukirman', 'Marto Utomo', 'Sarno Wijaya',
    'Paidi Saputra', 'Kasiran', 'Sutrisno', 'Ngatiman', 'Warno Santoso',
    'Sugianto', 'Wagiman', 'Suparjo', 'Ngatijo', 'Sarju',
    'Kamto', 'Dulhadi', 'Wagimin', 'Sarpin', 'Kusno',
  ]
  const statusPool = ['Hadir', 'Hadir', 'Hadir', 'Absen', 'Hadir']

  return nama.map((n, i) => {
    const upah = 85000 + (i % 4) * 5000
    const hadirBulanIni = 12 + (i % 15)
    return {
      id: i + 1,
      nama: n,
      divisi: DIVISI_LIST[i % DIVISI_LIST.length],
      tanggalDaftar: new Date(2026, 3, (i % 27) + 1).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      hadirBulanIni,
      upahHarian: upah,
      statusHariIni: statusPool[i % statusPool.length],
    }
  })
}

export function useBHL() {
  const loading = ref(true)
  const error = ref(null)

  const searchQuery = ref('')
  const filterDivisi = ref('Semua Divisi')
  const filterStatus = ref('Semua Status')

  const divisiOptions = ['Semua Divisi', ...DIVISI_LIST]
  const statusOptions = ['Semua Status', 'Hadir', 'Absen']

  const data = ref([])

  async function fetchData() {
    loading.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 350))
        data.value = buatBHL()
      } else {
        // TODO: ganti dengan pemanggilan API asli
        // const res = await api.get('/bhl')
        // data.value = res.data
      }
    } catch (e) {
      error.value = 'Gagal memuat data BHL. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchData)

  const stats = computed(() => {
    const total = data.value.length
    const hadir = data.value.filter((d) => d.statusHariIni === 'Hadir').length
    const absen = data.value.filter((d) => d.statusHariIni === 'Absen').length
    const totalUpah = data.value
      .filter((d) => d.statusHariIni === 'Hadir')
      .reduce((sum, d) => sum + d.upahHarian, 0)

    return [
      { title: 'Total BHL Terdaftar', value: total },
      { title: 'Hadir Hari Ini', value: hadir },
      { title: 'Absen Hari Ini', value: absen },
      { title: 'Total Upah Hari Ini', value: `Rp ${totalUpah.toLocaleString('id-ID')}` },
    ]
  })

  const filtered = computed(() => {
    return data.value.filter((d) => {
      const cocokSearch = d.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
      const cocokDivisi = filterDivisi.value === 'Semua Divisi' || d.divisi === filterDivisi.value
      const cocokStatus = filterStatus.value === 'Semua Status' || d.statusHariIni === filterStatus.value
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