/**
 * ============================================================
 *  FILE: src/composables/useStrukturOrganisasi.js
 * ============================================================
 *  Data struktur organisasi berbentuk tree/hierarki.
 *  Setiap node punya: nama, jabatan, foto inisial, dan children.
 * ============================================================
 */

import { ref, onMounted } from 'vue'

const USE_MOCK = true

function buatStruktur() {
  return {
    id: 1,
    nama: 'H. Slamet Wibowo',
    jabatan: 'Direktur Utama',
    divisi: 'Direksi',
    children: [
      {
        id: 2,
        nama: 'Dra. Ratna Kumala',
        jabatan: 'Manager Produksi',
        divisi: 'Produksi',
        children: [
          { id: 21, nama: 'Andi Saputra', jabatan: 'Kepala Regu Produksi', divisi: 'Produksi', children: [] },
          { id: 22, nama: 'Budi Santoso', jabatan: 'Supervisor Shift Pagi', divisi: 'Produksi', children: [] },
          { id: 23, nama: 'Fajar Nugroho', jabatan: 'Supervisor Shift Siang', divisi: 'Produksi', children: [] },
        ],
      },
      {
        id: 3,
        nama: 'Ir. Bambang Kusuma',
        jabatan: 'Manager Teknik',
        divisi: 'Teknik',
        children: [
          { id: 31, nama: 'Joko Widodo', jabatan: 'Kepala Teknisi', divisi: 'Teknik', children: [] },
          { id: 32, nama: 'Hendra Wijaya', jabatan: 'Teknisi Listrik', divisi: 'Teknik', children: [] },
        ],
      },
      {
        id: 4,
        nama: 'Siti Aminah, S.E.',
        jabatan: 'Manager HRD & Administrasi',
        divisi: 'HRD',
        children: [
          { id: 41, nama: 'Dewi Lestari', jabatan: 'Staff HRD', divisi: 'HRD', children: [] },
          { id: 42, nama: 'Yuni Astuti', jabatan: 'Staff Administrasi', divisi: 'Administrasi', children: [] },
        ],
      },
      {
        id: 5,
        nama: 'Agus Salim',
        jabatan: 'Manager Gudang & Logistik',
        divisi: 'Gudang',
        children: [
          { id: 51, nama: 'Rudi Hartono', jabatan: 'Kepala Gudang', divisi: 'Gudang', children: [] },
          { id: 52, nama: 'Tono Sucipto', jabatan: 'Staff Logistik', divisi: 'Gudang', children: [] },
        ],
      },
    ],
  }
}

const divisiWarna = {
  'Direksi':       { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)', text: '#7c3aed' },
  'Produksi':      { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.35)', text: '#0284c7' },
  'Teknik':        { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#b45309' },
  'HRD':           { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#047857' },
  'Administrasi':  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#047857' },
  'Gudang':        { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  text: '#b91c1c' },
}

export function useStrukturOrganisasi() {
  const loading = ref(true)
  const error = ref(null)
  const struktur = ref(null)

  async function fetchData() {
    loading.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 350))
        struktur.value = buatStruktur()
      } else {
        // TODO: ganti dengan pemanggilan API asli
        // const res = await api.get('/struktur-organisasi')
        // struktur.value = res.data
      }
    } catch (e) {
      error.value = 'Gagal memuat struktur organisasi. Silakan coba lagi.'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchData)

  function warnaDivisi(divisi) {
    return divisiWarna[divisi] ?? { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.35)', text: '#334155' }
  }

  return { loading, error, struktur, warnaDivisi, refetch: fetchData }
}