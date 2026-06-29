import { ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  TrendingUp, Clock3, Users, BadgeDollarSign,
  Shield, UserPlus, Briefcase, LockKeyhole,
} from 'lucide-vue-next'

// Singleton state — shared across all pages that import this composable
const sidebarOpen       = ref(true)
const mobileSidebarOpen = ref(false)
const openedMenu        = ref('Beranda Utama')

export const ROUTE_MAP = {
  // ── Beranda Utama ──────────────────────────────────────
  'Dashboard':              '/dashboard',
  'Monitor Absensi':        '/dashboard/monitor-absensi',
  'Ringkasan Data Pegawai': '/dashboard/ringkasan-pegawai',
  'Panel Persetujuan':      '/dashboard/panel-persetujuan',

  // ── Manajemen Absensi ──────────────────────────────────
  'Log Kehadiran':          '/manajemen-absensi/log-kehadiran',
  'Penjadwalan Shift':      '/manajemen-absensi/penjadwalan-shift',
  'Pengajuan Cuti & Izin':  '/manajemen-absensi/pengajuan-cuti-izin',
  'Log Lembur':             '/manajemen-absensi/log-lembur',
}

export const MENUS = [
  { title: 'Beranda Utama',     icon: TrendingUp,      children: ['Dashboard', 'Monitor Absensi', 'Ringkasan Data Pegawai', 'Panel Persetujuan'] },
  { title: 'Manajemen Absensi', icon: Clock3,          children: ['Log Kehadiran', 'Penjadwalan Shift', 'Pengajuan Cuti & Izin', 'Log Lembur'] },
  { title: 'Profil Pegawai',    icon: Users,           children: ['Pegawai Tetap', 'Pegawai Musiman', 'BHL', 'Struktur Organisasi'] },
  { title: 'Penggajian',        icon: BadgeDollarSign, children: ['Proses Gaji', 'Upah Harian', 'Insentif', 'Slip Gaji'] },
  { title: 'Keselamatan Kerja', icon: Shield,          children: ['Laporan Insiden', 'Medical Check Up', 'Inventaris APD'] },
  { title: 'Rekrutmen',         icon: UserPlus,        children: ['Lowongan Aktif', 'Database Pelamar'] },
  { title: 'Serikat Pekerja',   icon: Briefcase,       children: ['Keanggotaan', 'Iuran'] },
  { title: 'Sistem & Keamanan', icon: LockKeyhole,     children: ['Hak Akses', 'Log Aktivitas'] },
]

export function useSidebar() {
  const router = useRouter()

  const toggleMenu = (title) => {
    openedMenu.value = openedMenu.value === title ? '' : title
  }

  const navigateTo = (child) => {
    const path = ROUTE_MAP[child]
    if (path) router.push(path)
    mobileSidebarOpen.value = false
  }

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      router.push({ name: 'Login' })
    }
  }

  return {
    sidebarOpen,
    mobileSidebarOpen,
    openedMenu,
    toggleMenu,
    navigateTo,
    handleLogout,
    ROUTE_MAP,
    MENUS,
  }
}