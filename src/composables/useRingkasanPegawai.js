// composables/useRingkasanPegawai.js
import { ref, computed, onMounted } from 'vue'
import {
  Users, Building2, Clock3, UserCheck,
  BarChart3, Briefcase,
} from 'lucide-vue-next'

/* ─────────────────────────────────────────────
   KONSTANTA STATIS
───────────────────────────────────────────── */
export const FILTER_TYPES     = ['Semua', 'Tetap', 'Musiman', 'BHL']
export const FILTER_DIVISIONS = ['Semua', 'Produksi', 'QC', 'Gudang', 'Teknik', 'Admin']

export const SUMMARY_CARDS = [
  {
    title: 'Pegawai Tetap',
    value: 145,
    icon: Users,
    iconColor: '#0ea5e9',
    bg:     'rgba(14,165,233,0.12)',
    border: 'rgba(14,165,233,0.30)',
    glow:   'rgba(14,165,233,0.22)',
  },
  {
    title: 'Pegawai Musiman',
    value: 87,
    icon: Building2,
    iconColor: '#10b981',
    bg:     'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.30)',
    glow:   'rgba(16,185,129,0.22)',
  },
  {
    title: 'BHL',
    value: 96,
    icon: Clock3,
    iconColor: '#f59e0b',
    bg:     'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.30)',
    glow:   'rgba(245,158,11,0.22)',
  },
  {
    title: 'Total Aktif',
    value: 328,
    icon: UserCheck,
    iconColor: '#8b5cf6',
    bg:     'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.30)',
    glow:   'rgba(139,92,246,0.22)',
  },
]

export const DIVISION_DATA = [
  {
    name: 'Produksi', count: 124, pct: 38,
    color: 'from-sky-500 to-blue-400',
    badge: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  {
    name: 'Gudang', count: 68, pct: 21,
    color: 'from-emerald-500 to-green-400',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  {
    name: 'QC', count: 52, pct: 16,
    color: 'from-violet-500 to-purple-400',
    badge: 'bg-violet-50 text-violet-700 border border-violet-200',
  },
  {
    name: 'Teknik', count: 45, pct: 14,
    color: 'from-amber-500 to-orange-400',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  {
    name: 'Admin', count: 39, pct: 11,
    color: 'from-rose-500 to-pink-400',
    badge: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
]

export const EMPLOYMENT_TYPES = [
  {
    label: 'Pegawai Tetap',
    sub:   'Kontrak tidak terbatas',
    count: 145,
    pct:   '44.2%',
    dot:   'bg-sky-400',
    num:   'text-sky-600',
  },
  {
    label: 'Pegawai Musiman',
    sub:   'Masa giling aktif',
    count: 87,
    pct:   '26.5%',
    dot:   'bg-emerald-400',
    num:   'text-emerald-600',
  },
  {
    label: 'Buruh Harian Lepas',
    sub:   'Upah per hari kerja',
    count: 96,
    pct:   '29.3%',
    dot:   'bg-amber-400',
    num:   'text-amber-600',
  },
]

/* ─────────────────────────────────────────────
   DATA AWAL PEGAWAI
   Ganti ini dengan pemanggilan API nyata di masa depan:
     const employees = ref(await fetchPegawai())
───────────────────────────────────────────── */
const INITIAL_EMPLOYEES = [
  { id: 1,  name: 'Andi Saputra',   division: 'Produksi', type: 'Tetap',   position: 'Operator Mesin',  phone: '0812-1234-5678', email: 'andi@hrm.com',   joined: '2019-03-15', status: 'Aktif' },
  { id: 2,  name: 'Budi Santoso',   division: 'QC',       type: 'Tetap',   position: 'QC Inspector',    phone: '0813-2345-6789', email: 'budi@hrm.com',   joined: '2020-07-01', status: 'Aktif' },
  { id: 3,  name: 'Ahmad Rizki',    division: 'Produksi', type: 'Tetap',   position: 'Operator Senior', phone: '0814-3456-7890', email: 'ahmad@hrm.com',  joined: '2018-01-10', status: 'Aktif' },
  { id: 4,  name: 'Yoga Pratama',   division: 'Gudang',   type: 'Musiman', position: 'Staff Gudang',    phone: '0815-4567-8901', email: 'yoga@hrm.com',   joined: '2025-06-01', status: 'Aktif' },
  { id: 5,  name: 'Rudi Hartono',   division: 'Gudang',   type: 'Tetap',   position: 'Kepala Gudang',   phone: '0816-5678-9012', email: 'rudi@hrm.com',   joined: '2017-05-20', status: 'Aktif' },
  { id: 6,  name: 'Fajar Nugroho',  division: 'Teknik',   type: 'Tetap',   position: 'Teknisi Mesin',   phone: '0817-6789-0123', email: 'fajar@hrm.com',  joined: '2021-02-14', status: 'Aktif' },
  { id: 7,  name: 'Rio Saputra',    division: 'QC',       type: 'Musiman', position: 'QC Staff',        phone: '0818-7890-1234', email: 'rio@hrm.com',    joined: '2025-06-01', status: 'Aktif' },
  { id: 8,  name: 'Dewi Rahayu',    division: 'Admin',    type: 'Tetap',   position: 'Staff HRD',       phone: '0819-8901-2345', email: 'dewi@hrm.com',   joined: '2022-09-05', status: 'Aktif' },
  { id: 9,  name: 'Siti Aminah',    division: 'Produksi', type: 'BHL',     position: 'Operator Harian', phone: '0820-9012-3456', email: '-',              joined: '2026-01-10', status: 'Aktif' },
  { id: 10, name: 'Joko Widodo',    division: 'Teknik',   type: 'Tetap',   position: 'Kepala Teknik',   phone: '0821-0123-4567', email: 'joko@hrm.com',   joined: '2016-11-30', status: 'Aktif' },
  { id: 11, name: 'Hendra Gunawan', division: 'Produksi', type: 'Musiman', position: 'Operator Giling', phone: '0822-1234-5678', email: '-',              joined: '2025-06-01', status: 'Aktif' },
  { id: 12, name: 'Putri Lestari',  division: 'Admin',    type: 'Tetap',   position: 'Sekretaris',      phone: '0823-2345-6789', email: 'putri@hrm.com',  joined: '2023-04-18', status: 'Aktif' },
  { id: 13, name: 'Wahyu Setiawan', division: 'Gudang',   type: 'BHL',     position: 'Kuli Angkut',     phone: '0824-3456-7890', email: '-',              joined: '2026-02-01', status: 'Aktif' },
  { id: 14, name: 'Agus Budiman',   division: 'Produksi', type: 'BHL',     position: 'Operator Harian', phone: '0825-4567-8901', email: '-',              joined: '2026-01-15', status: 'Aktif' },
  { id: 15, name: 'Linda Sari',     division: 'QC',       type: 'Tetap',   position: 'QC Senior',       phone: '0826-5678-9012', email: 'linda@hrm.com',  joined: '2019-08-22', status: 'Aktif' },
]

/* ─────────────────────────────────────────────
   HELPER MURNI (PURE HELPERS)
───────────────────────────────────────────── */
const TYPE_BADGE_MAP = {
  Tetap:   'bg-sky-50     text-sky-700     border-2 border-sky-200',
  Musiman: 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200',
  BHL:     'bg-amber-50   text-amber-700   border-2 border-amber-200',
}
const AVATAR_COLORS = [
  'from-sky-100 to-blue-100 text-sky-700 border-sky-200',
  'from-emerald-100 to-green-100 text-emerald-700 border-emerald-200',
  'from-violet-100 to-purple-100 text-violet-700 border-violet-200',
  'from-amber-100 to-orange-100 text-amber-700 border-amber-200',
  'from-rose-100 to-pink-100 text-rose-700 border-rose-200',
]

export function getTypeBadge(type) {
  return TYPE_BADGE_MAP[type] ?? 'bg-slate-100 text-slate-600'
}

export function getAvatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

/* ─────────────────────────────────────────────
   COMPOSABLE UTAMA
───────────────────────────────────────────── */
export function useRingkasanPegawai() {
  /* State */
  const loading          = ref(true)
  const error            = ref(null)
  const employees        = ref([])
  const selectedEmployee = ref(null)
  const searchQuery      = ref('')
  const filterType       = ref('Semua')
  const filterDiv        = ref('Semua')

  /* Fetch / simulasi API */
  async function fetchPegawai() {
    loading.value = true
    error.value   = null
    try {
      // TODO: ganti dengan pemanggilan API nyata, misalnya:
      //   const res = await api.get('/pegawai')
      //   employees.value = res.data
      await new Promise((r) => setTimeout(r, 500))
      employees.value = INITIAL_EMPLOYEES
    } catch (err) {
      error.value = 'Gagal memuat data pegawai'
      console.error('[useRingkasanPegawai] fetchPegawai:', err)
    } finally {
      loading.value = false
    }
  }

  /* Daftar terfilter */
  const filteredEmployees = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return employees.value.filter((e) => {
      const matchSearch = !q
        || e.name.toLowerCase().includes(q)
        || e.division.toLowerCase().includes(q)
        || e.position.toLowerCase().includes(q)
      const matchType = filterType.value === 'Semua' || e.type === filterType.value
      const matchDiv  = filterDiv.value  === 'Semua' || e.division === filterDiv.value
      return matchSearch && matchType && matchDiv
    })
  })

  /* Toggle detail panel */
  function selectEmployee(emp) {
    selectedEmployee.value = selectedEmployee.value?.id === emp.id ? null : emp
  }

  /* Lifecycle */
  onMounted(fetchPegawai)

  return {
    /* State */
    loading,
    error,
    employees,
    selectedEmployee,
    searchQuery,
    filterType,
    filterDiv,

    /* Computed */
    filteredEmployees,

    /* Actions */
    fetchPegawai,
    selectEmployee,
  }
}