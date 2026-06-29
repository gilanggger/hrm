import { ref, computed, onMounted } from 'vue'

import {
  ClipboardCheck,
  Check,
  X,
  Clock,
  CalendarDays,
  TimerReset,
  AlertCircle,
  User,
} from 'lucide-vue-next'

import {
  getApprovals,
  approveApproval,
  rejectApproval,
} from '@/api/PanelPersetujuan'

/* ============================================================
   DUMMY DATA
============================================================ */

const DUMMY_APPROVALS = [
  {
    id: 1,
    name: 'Budi Santoso',
    division: 'QC',
    type: 'Cuti Tahunan',
    start: '2026-05-27',
    end: '2026-05-29',
    days: 3,
    reason: 'Keperluan keluarga',
    status: 'Menunggu',
    submitted: '2026-05-24',
  },
  {
    id: 2,
    name: 'Andi Saputra',
    division: 'Produksi',
    type: 'Lembur',
    start: '2026-05-25',
    end: '2026-05-25',
    days: 1,
    reason: 'Produksi mendesak giling',
    status: 'Menunggu',
    submitted: '2026-05-24',
  },
  {
    id: 3,
    name: 'Rudi Harton',
    division: 'Gudang',
    type: 'Izin Sakit',
    start: '2026-05-25',
    end: '2026-05-26',
    days: 2,
    reason: 'Demam dan batuk pilek',
    status: 'Menunggu',
    submitted: '2026-05-25',
  },
]

export function usePanelPersetujuan() {
  const loading = ref(true)
  const error = ref(null)

  const approvals = ref([])

  const filterStatus = ref('Semua')
  const filterType = ref('Semua')
  const searchQuery = ref('')

  const rejectReason = ref({})
  const showRejectModal = ref(null)

  const statuses = [
    'Semua',
    'Menunggu',
    'Disetujui',
    'Ditolak',
  ]

  const types = [
    'Semua',
    'Cuti Tahunan',
    'Lembur',
    'Izin Sakit',
    'Izin Khusus',
    'Cuti Melahirkan',
  ]

  const fetchApprovals = async () => {
    loading.value = true
    error.value = null

    try {

      // BACKEND READY

      // approvals.value = await getApprovals()

      // DUMMY

      await new Promise(resolve =>
        setTimeout(resolve, 500)
      )

      approvals.value = DUMMY_APPROVALS

    } catch (err) {
      console.error(err)
      error.value = 'Gagal memuat data approval'
    } finally {
      loading.value = false
    }
  }

  const filtered = computed(() =>
    approvals.value.filter(item => {

      const matchSearch =
        item.name
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        item.type
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())

      const matchStatus =
        filterStatus.value === 'Semua' ||
        item.status === filterStatus.value

      const matchType =
        filterType.value === 'Semua' ||
        item.type === filterType.value

      return (
        matchSearch &&
        matchStatus &&
        matchType
      )
    })
  )

  const pendingCount = computed(() =>
    approvals.value.filter(
      item => item.status === 'Menunggu'
    ).length
  )

  const summaryStats = computed(() => [
    {
      title: 'Menunggu',
      value: approvals.value.filter(
        x => x.status === 'Menunggu'
      ).length,
      icon: Clock,
      bg: 'rgba(245,158,11,0.10)',
      border: 'rgba(245,158,11,0.25)',
    },
    {
      title: 'Disetujui',
      value: approvals.value.filter(
        x => x.status === 'Disetujui'
      ).length,
      icon: Check,
      bg: 'rgba(16,185,129,0.10)',
      border: 'rgba(16,185,129,0.25)',
    },
    {
      title: 'Ditolak',
      value: approvals.value.filter(
        x => x.status === 'Ditolak'
      ).length,
      icon: X,
      bg: 'rgba(239,68,68,0.10)',
      border: 'rgba(239,68,68,0.25)',
    },
    {
      title: 'Total',
      value: approvals.value.length,
      icon: ClipboardCheck,
      bg: 'rgba(14,165,233,0.10)',
      border: 'rgba(14,165,233,0.25)',
    },
  ])

  const approve = async (id) => {
    try {

      // BACKEND READY

      // await approveApproval(id)
      // await fetchApprovals()

      const idx = approvals.value.findIndex(
        item => item.id === id
      )

      if (idx !== -1) {
        approvals.value[idx].status = 'Disetujui'
      }

    } catch (err) {
      console.error(err)
    }
  }

  const reject = (id) => {
    showRejectModal.value = id
  }

  const confirmReject = async () => {
    try {

      // BACKEND READY

      // await rejectApproval(
      //   showRejectModal.value,
      //   rejectReason.value[showRejectModal.value]
      // )

      const idx = approvals.value.findIndex(
        item => item.id === showRejectModal.value
      )

      if (idx !== -1) {
        approvals.value[idx].status = 'Ditolak'
      }

      showRejectModal.value = null

    } catch (err) {
      console.error(err)
    }
  }

  const statusClass = (status) => {
    const map = {
      Menunggu:
        'bg-amber-50 text-amber-600 border border-amber-200',

      Disetujui:
        'bg-emerald-50 text-emerald-600 border border-emerald-200',

      Ditolak:
        'bg-red-50 text-red-500 border border-red-200',
    }

    return map[status]
  }

  const typeIcon = (type) => {
    const map = {
      Lembur: TimerReset,
      'Izin Sakit': AlertCircle,
      'Cuti Melahirkan': User,
    }

    return map[type] || CalendarDays
  }

  onMounted(fetchApprovals)

  return {
    loading,
    error,

    approvals,

    filterStatus,
    filterType,
    searchQuery,

    statuses,
    types,

    filtered,
    pendingCount,
    summaryStats,

    rejectReason,
    showRejectModal,

    approve,
    reject,
    confirmReject,

    statusClass,
    typeIcon,

    refetch: fetchApprovals,
  }
}