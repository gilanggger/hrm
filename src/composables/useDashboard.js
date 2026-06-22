/**
 * FILE: src/composables/useDashboard.js
 * Menggunakan data dummy jika backend belum tersedia.
 * Hapus bagian DUMMY DATA dan aktifkan bagian API
 * setelah backend siap.
 */

import { ref, onMounted } from 'vue'

// ── DUMMY DATA (hapus setelah backend siap) ────────────────
const DUMMY = {
  attendanceToday: [
    { title: 'Hadir',       total: 328 },
    { title: 'Izin',        total: 12  },
    { title: 'Terlambat',   total: 8   },
    { title: 'Shift Aktif', total: 3   },
  ],
  employees: [
    { title: 'Pegawai Tetap',   total: 145 },
    { title: 'Pegawai Musiman', total: 87  },
    { title: 'BHL',             total: 96  },
  ],
  approvals: [
    { id: 1, name: 'Cuti Tahunan',  employee: 'Budi Santoso', status: 'Menunggu' },
    { id: 2, name: 'Lembur Giling', employee: 'Andi Saputra', status: 'Menunggu' },
    { id: 3, name: 'Izin Sakit',    employee: 'Rudi Hartono', status: 'Menunggu' },
  ],
  activities: [
    'Absensi shift pagi berhasil diperbarui',
    'Slip gaji Mei telah diproses',
    'Pengajuan lembur baru masuk',
    'Data pegawai musiman diperbarui',
    'Sistem payroll berhasil sinkron',
  ],
  fastestAttendance: [
    { name: 'Andi Saputra',  division: 'Produksi', time: '06:01' },
    { name: 'Budi Santoso',  division: 'QC',       time: '06:03' },
    { name: 'Rudi Hartono',  division: 'Gudang',   time: '06:05' },
    { name: 'Fajar Nugroho', division: 'Teknik',   time: '06:07' },
  ],
  lateEmployees: [
    { name: 'Ahmad Rizki',  division: 'Produksi', late: '18 Menit' },
    { name: 'Yoga Pratama', division: 'Gudang',   late: '12 Menit' },
    { name: 'Rio Saputra',  division: 'QC',       late: '9 Menit'  },
  ],
  monthlyAttendance: [
    { name: 'Andi Saputra',  hadir: '22/31', alpha: 1, izin: 2 },
    { name: 'Budi Santoso',  hadir: '28/31', alpha: 0, izin: 1 },
    { name: 'Rudi Hartono',  hadir: '25/31', alpha: 2, izin: 1 },
    { name: 'Fajar Nugroho', hadir: '30/31', alpha: 0, izin: 0 },
  ],
  warningEmployees: [
    { name: 'Ahmad Rizki',  division: 'Produksi', totalLate: 14, warning: 'SP 1' },
    { name: 'Yoga Pratama', division: 'Gudang',   totalLate: 11, warning: 'SP 1' },
    { name: 'Rio Saputra',  division: 'QC',       totalLate: 18, warning: 'SP 2' },
  ],
  chartBars: [
    { label: 'Sen', value: 85 },
    { label: 'Sel', value: 70 },
    { label: 'Rab', value: 45 },
    { label: 'Kam', value: 30 },
    { label: 'Jum', value: 92 },
  ],
  payroll: {
    amount: 'Rp 245 JT',
    status: 'Tersinkron',
    description: 'Proses payroll berjalan lancar dan seluruh data sinkron.',
  },
}
// ── END DUMMY DATA ─────────────────────────────────────────

export function useDashboard() {
  const loading = ref(true)
  const error   = ref(null)

  const attendanceToday   = ref([])
  const employees         = ref([])
  const approvals         = ref([])
  const activities        = ref([])
  const fastestAttendance = ref([])
  const lateEmployees     = ref([])
  const monthlyAttendance = ref([])
  const warningEmployees  = ref([])
  const chartBars         = ref([])
  const payroll           = ref({ amount: '-', status: '-', description: '-' })

  const fetchAll = async () => {
    loading.value = true
    error.value   = null
    try {

      // ── AKTIFKAN INI setelah backend siap ──────────────
      // const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      // const res = await fetch(`${BASE_URL}/dashboard`)
      // const data = await res.json()
      // attendanceToday.value   = data.attendanceToday
      // employees.value         = data.employees
      // approvals.value         = data.approvals
      // activities.value        = data.activities
      // fastestAttendance.value = data.fastestAttendance
      // lateEmployees.value     = data.lateEmployees
      // monthlyAttendance.value = data.monthlyAttendance
      // warningEmployees.value  = data.warningEmployees
      // chartBars.value         = data.chartBars
      // payroll.value           = data.payroll
      // ───────────────────────────────────────────────────

      // ── HAPUS BAGIAN INI setelah backend siap ──────────
      await new Promise(r => setTimeout(r, 600)) // simulasi loading
      attendanceToday.value   = DUMMY.attendanceToday
      employees.value         = DUMMY.employees
      approvals.value         = DUMMY.approvals
      activities.value        = DUMMY.activities
      fastestAttendance.value = DUMMY.fastestAttendance
      lateEmployees.value     = DUMMY.lateEmployees
      monthlyAttendance.value = DUMMY.monthlyAttendance
      warningEmployees.value  = DUMMY.warningEmployees
      chartBars.value         = DUMMY.chartBars
      payroll.value           = DUMMY.payroll
      // ───────────────────────────────────────────────────

    } catch (err) {
      console.error('Gagal memuat data dashboard:', err)
      error.value = 'Gagal memuat data. Periksa koneksi atau hubungi backend.'
    } finally {
      loading.value = false
    }
  }

  const sendWarning = async (employee) => {
    // Aktifkan fetch ke backend jika sudah siap:
    // await fetch(`${BASE_URL}/dashboard/send-warning`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ employeeName: employee.name, warning: employee.warning }),
    // })
    alert(`Surat peringatan (${employee.warning}) berhasil dikirim kepada ${employee.name}`)
  }

  onMounted(fetchAll)

  return {
    loading, error,
    attendanceToday, employees, approvals, activities,
    fastestAttendance, lateEmployees, monthlyAttendance,
    warningEmployees, chartBars, payroll,
    sendWarning,
    refetch: fetchAll,
  }
}