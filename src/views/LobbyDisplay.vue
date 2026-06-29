<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  Users, UserCheck, UserX, Clock3, AlarmClock,
  CalendarDays, Factory, TrendingUp, Award,
  Maximize, Minimize, Wifi,
} from 'lucide-vue-next'

// ── Fullscreen ────────────────────────────────────────────────
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}
const onFullscreenChange = () => { isFullscreen.value = !!document.fullscreenElement }

// ── Clock ─────────────────────────────────────────────────────
const now = ref(new Date())
let clockTimer = null
const timeStr = computed(() =>
  now.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
)
const dateStr = computed(() =>
  now.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

// ── Counters (animasi angka naik) ────────────────────────
const TARGETS = { hadir:328, terlambat:8, izin:12, alpha:4, shift:3, total:352 }
const displayVals = ref({ hadir:0, terlambat:0, izin:0, alpha:4, shift:0, total:0 })
const shiftDisplay = ref({ pagi:0, siang:0, malam:0 })
const rateDisplay  = ref(0)

function animCount(obj, key, target, duration = 1800, delay = 0) {
  setTimeout(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      obj[key] = Math.round(ease * target)
      if (p < 1) requestAnimationFrame(step)
      else obj[key] = target
    }
    requestAnimationFrame(step)
  }, delay)
}

// ── Stats data ────────────────────────────────────────────────
const stats = [
  { key:'hadir',     label:'Hadir Hari Ini', sub:'dari 352 pegawai', icon: UserCheck,    color:'text-emerald-700', bg:'bg-emerald-50',  border:'border-emerald-300', glow:'#d1fae5' },
  { key:'terlambat', label:'Terlambat',       sub:'pegawai',          icon: AlarmClock,   color:'text-amber-700',   bg:'bg-amber-50',    border:'border-amber-300',   glow:'#fef3c7' },
  { key:'izin',      label:'Izin / Sakit',    sub:'pegawai',          icon: CalendarDays, color:'text-sky-700',     bg:'bg-sky-50',      border:'border-sky-300',     glow:'#e0f2fe' },
  { key:'alpha',     label:'Tidak Hadir',     sub:'alpha',            icon: UserX,        color:'text-red-700',     bg:'bg-red-50',      border:'border-red-300',     glow:'#fee2e2' },
  { key:'shift',     label:'Shift Aktif',     sub:'shift berjalan',   icon: Factory,      color:'text-indigo-700',  bg:'bg-indigo-50',   border:'border-indigo-300',  glow:'#e0e7ff' },
  { key:'total',     label:'Total Pegawai',   sub:'seluruh divisi',   icon: Users,        color:'text-blue-700',    bg:'bg-blue-50',     border:'border-blue-300',    glow:'#dbeafe' },
]

const attendanceRate = computed(() => Math.round((328 / 352) * 100))

// ── Shifts ────────────────────────────────────────────────────
const shifts = [
  { key:'pagi',  name:'Shift Pagi',  time:'06:00 – 14:00', hadir:140, total:148, color:'from-sky-500 to-blue-400' },
  { key:'siang', name:'Shift Siang', time:'14:00 – 22:00', hadir:105, total:112, color:'from-emerald-500 to-teal-400' },
  { key:'malam', name:'Shift Malam', time:'22:00 – 06:00', hadir:83,  total:92,  color:'from-violet-500 to-purple-400' },
]

// ── Top attendance ─────────────────────────────────────────────
const topAttendance = ref([
  { rank:1, name:'Andi Saputra',  division:'Produksi', time:'06:01' },
  { rank:2, name:'Budi Santoso',  division:'QC',       time:'06:03' },
  { rank:3, name:'Rudi Hartono',  division:'Gudang',   time:'06:05' },
  { rank:4, name:'Fajar Nugroho', division:'Teknik',   time:'06:07' },
  { rank:5, name:'Joko Widodo',   division:'Teknik',   time:'06:10' },
])

// ── Divisions ─────────────────────────────────────────────────
const divisions = [
  { name:'Produksi', hadir:118, total:124, color:'from-sky-500 to-blue-400' },
  { name:'Gudang',   hadir:62,  total:68,  color:'from-emerald-500 to-teal-400' },
  { name:'QC',       hadir:50,  total:52,  color:'from-violet-500 to-purple-400' },
  { name:'Teknik',   hadir:43,  total:45,  color:'from-amber-500 to-orange-400' },
  { name:'Admin',    hadir:35,  total:39,  color:'from-rose-500 to-pink-400' },
]

// ── Ticker ────────────────────────────────────────────────────
const ticker = [
  '✅ Absensi shift pagi telah selesai direkap',
  '📋 Slip gaji bulan Mei sudah dapat diambil di HRD',
  '⚠️ Harap mematuhi protokol keselamatan kerja di area produksi',
  '🏭 Target produksi hari ini: 450 ton — Mari semangat bekerja!',
  '📢 Rapat koordinasi divisi Teknik pukul 13.00 di Ruang Meeting A',
  '🎉 Selamat kepada tim QC atas pencapaian zero defect minggu ini!',
]
const tickerIndex   = ref(0)
const tickerVisible = ref(true)
let tickerTimer = null

// ── Quotes ────────────────────────────────────────────────────
const quotes = [
  { text:'Kerja keras hari ini adalah fondasi kesuksesan esok hari.',           author:'Pabrik Gula Modern' },
  { text:'Keselamatan kerja adalah tanggung jawab kita bersama.',                author:'K3 Division' },
  { text:'Kualitas bukan kebetulan, ia adalah hasil dari usaha yang konsisten.', author:'QC Team' },
  { text:'Bersama kita bisa mencapai lebih dari yang kita bayangkan.',           author:'HRD' },
]
const quoteIndex  = ref(0)
let quoteTimer = null
const currentQuote = computed(() => quotes[quoteIndex.value])

// ── Rank color ────────────────────────────────────────────────
const rankColor = (rank) => {
  if (rank === 1) return 'text-yellow-700 bg-yellow-100 border-yellow-400'
  if (rank === 2) return 'text-slate-600 bg-slate-100 border-slate-400'
  if (rank === 3) return 'text-amber-800 bg-amber-100 border-amber-400'
  return 'text-slate-500 bg-slate-100 border-slate-300'
}

// ── Visible tracking (untuk stagger entrance) ─────────────────
const statsVisible  = ref(false)
const shiftsVisible = ref(false)
const divVisible    = ref(false)
const topVisible    = ref(false)

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)

  // Stagger entrance flags
  setTimeout(() => { statsVisible.value  = true }, 100)
  setTimeout(() => { shiftsVisible.value = true }, 300)
  setTimeout(() => { divVisible.value    = true }, 500)
  setTimeout(() => { topVisible.value    = true }, 400)

  // Counter animations
  animCount(displayVals.value, 'hadir',     328, 2000, 200)
  animCount(displayVals.value, 'terlambat', 8,   1200, 350)
  animCount(displayVals.value, 'izin',      12,  1400, 500)
  animCount(displayVals.value, 'alpha',     4,   1000, 650)
  animCount(displayVals.value, 'shift',     3,   800,  800)
  animCount(displayVals.value, 'total',     352, 2000, 150)
  animCount(shiftDisplay.value,'pagi',      140, 1600, 400)
  animCount(shiftDisplay.value,'siang',     105, 1600, 550)
  animCount(shiftDisplay.value,'malam',     83,  1600, 700)

  // Rate bar counter
  let rStart = null
  const animRate = (ts) => {
    if (!rStart) rStart = ts
    const p = Math.min((ts - rStart) / 2000, 1)
    rateDisplay.value = Math.round((1 - Math.pow(1 - p, 3)) * 93)
    if (p < 1) requestAnimationFrame(animRate)
    else rateDisplay.value = 93
  }
  setTimeout(() => requestAnimationFrame(animRate), 400)

  // Ticker
  tickerTimer = setInterval(() => {
    tickerVisible.value = false
    setTimeout(() => {
      tickerIndex.value = (tickerIndex.value + 1) % ticker.length
      tickerVisible.value = true
    }, 500)
  }, 5000)

  // Quote
  quoteTimer = setInterval(() => {
    quoteIndex.value = (quoteIndex.value + 1) % quotes.length
  }, 8000)

  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(tickerTimer)
  clearInterval(quoteTimer)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<template>
  <div class="lobby-root min-h-screen bg-[#E8EDF5] text-slate-900 overflow-hidden flex flex-col select-none">

    <!-- BACKGROUND -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute inset-0 bg-grid opacity-[0.35]" />
      <!-- floating orbs dengan animasi -->
      <div class="orb orb-1 absolute top-0 left-0 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[160px]" />
      <div class="orb orb-2 absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-[140px]" />
      <div class="orb orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[120px]" />
      <div class="orb orb-4 absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-emerald-100/20 rounded-full blur-[100px]" />
    </div>

    <!-- SCAN LINE -->
    <div class="scan-line fixed left-0 right-0 h-[2px] pointer-events-none z-50
                bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

    <!-- HEADER -->
    <header class="relative z-10 flex items-center justify-between gap-4 px-6 py-3
                   border-b-2 border-slate-300 header-bg flex-shrink-0 overflow-hidden">

      <!-- shimmer sweep di header -->
      <div class="header-shimmer absolute inset-0 pointer-events-none" />

      <!-- Logo -->
      <div class="relative z-10 flex items-center gap-3 slide-in-left">
        <div class="logo-icon w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
          <Factory :size="24" class="text-white" />
        </div>
        <div>
          <h1 class="text-xl font-black tracking-[0.12em] uppercase text-slate-900 leading-tight">HRM System</h1>
          <p class="text-blue-600 text-base tracking-widest uppercase font-bold leading-tight">Pabrik Gula Modern</p>
        </div>
      </div>

      <!-- Clock -->
      <div class="relative z-10 text-center fade-in-down">
        <div class="text-5xl font-black tabular-nums tracking-tight text-slate-900 leading-none clock-glow">
          {{ timeStr }}
        </div>
        <div class="text-slate-600 text-base mt-1 tracking-wide capitalize font-semibold">{{ dateStr }}</div>
      </div>

      <!-- Live badge + fullscreen -->
      <div class="relative z-10 flex items-center gap-3 slide-in-right">
        <div class="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 live-badge-pulse">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi :size="16" class="text-emerald-700" />
          <span class="text-emerald-800 text-base font-black tracking-widest uppercase">LIVE</span>
        </div>
        <button @click="toggleFullscreen" class="light-btn w-11 h-11 rounded-xl flex items-center justify-center">
          <Maximize v-if="!isFullscreen" :size="18" class="text-slate-600" />
          <Minimize v-else :size="18" class="text-slate-600" />
        </button>
      </div>
    </header>

    <!-- RATE BANNER -->
    <div class="relative z-10 px-6 py-2.5 border-b-2 border-slate-300 flex-shrink-0"
         style="background:rgba(255,255,255,0.92);backdrop-filter:blur(12px)">
      <div class="flex items-center gap-5">
        <div class="flex items-center gap-2 shrink-0">
          <TrendingUp :size="18" class="text-blue-600 trending-bounce" />
          <span class="text-slate-700 text-base font-black tracking-widest uppercase">Tingkat Kehadiran</span>
        </div>
        <div class="flex-1">
          <div class="h-4 rounded-full bg-slate-200 overflow-hidden relative">
            <div class="h-full rounded-full rate-fill-anim shimmer-bar"
                 style="background:linear-gradient(90deg,#1d4ed8,#0ea5e9,#06b6d4)" />
          </div>
        </div>
        <div class="text-4xl font-black tabular-nums text-blue-700 shrink-0 rate-num">
          {{ rateDisplay }}%
        </div>
      </div>
    </div>

    <!-- MAIN -->
    <div class="relative z-10 flex-1 grid grid-cols-12 gap-3 p-4 min-h-0">

      <!-- LEFT -->
      <div class="col-span-8 flex flex-col gap-3 min-h-0">

        <!-- Stat Cards -->
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="(item, i) in stats" :key="item.key"
            class="stat-card rounded-2xl p-4 border-2 flex items-center gap-3 cursor-default relative overflow-hidden"
            :class="[item.bg, item.border, statsVisible ? 'stat-visible' : 'stat-hidden']"
            :style="`animation-delay:${i * 80}ms`"
          >
            <!-- glow blob -->
            <div class="absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-50 pointer-events-none"
                 :style="`background:${item.glow}`" />
            <!-- shimmer overlay on hover -->
            <div class="card-shine absolute inset-0 pointer-events-none" />

            <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative z-10
                        bg-white shadow-sm border border-slate-200 icon-bounce-in"
                 :style="`animation-delay:${i*80 + 200}ms`">
              <component :is="item.icon" :size="22" :class="item.color" />
            </div>
            <div class="relative z-10 min-w-0">
              <div class="text-4xl font-black tabular-nums text-slate-900 leading-none">
                {{ displayVals[item.key] }}
              </div>
              <div class="text-base font-black mt-1 leading-tight truncate" :class="item.color">{{ item.label }}</div>
              <div class="text-sm text-slate-600 font-semibold mt-0.5">{{ item.sub }}</div>
            </div>
          </div>
        </div>

        <!-- Shift -->
        <div class="light-card rounded-2xl p-4 flex-1 min-h-0"
             :class="shiftsVisible ? 'section-visible' : 'section-hidden'">
          <div class="flex items-center gap-2 mb-3">
            <Clock3 :size="18" class="text-blue-600 spin-icon" />
            <h2 class="text-base font-black text-slate-700 uppercase tracking-widest">Status Shift Aktif</h2>
          </div>
          <div class="grid grid-cols-3 gap-3 h-[calc(100%-2.5rem)]">
            <div
              v-for="(shift, i) in shifts" :key="shift.key"
              class="inner-card rounded-xl p-4 flex flex-col justify-between shift-card-enter"
              :style="`animation-delay:${300 + i*120}ms`"
            >
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-lg font-black text-slate-800">{{ shift.name }}</span>
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"
                        :style="`animation-delay:${i*300}ms`" />
                </div>
                <div class="text-base text-slate-600 font-semibold mb-2">{{ shift.time }}</div>
                <div class="text-5xl font-black text-slate-900 tabular-nums leading-none mb-1">
                  {{ shiftDisplay[shift.key] }}
                </div>
                <div class="text-base text-slate-600 font-semibold">dari {{ shift.total }} pegawai</div>
              </div>
              <div>
                <div class="flex justify-between text-base mb-1.5">
                  <span class="text-slate-600 font-semibold">Kehadiran</span>
                  <span class="text-slate-800 font-black">{{ Math.round(shift.hadir/shift.total*100) }}%</span>
                </div>
                <div class="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r bar-fill shimmer-bar"
                       :class="shift.color"
                       :style="`--bar-w:${Math.round(shift.hadir/shift.total*100)}%; animation-delay:${600 + i*150}ms`" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Divisions -->
        <div class="light-card rounded-2xl p-4"
             :class="divVisible ? 'section-visible' : 'section-hidden'">
          <div class="flex items-center gap-2 mb-3">
            <Users :size="18" class="text-blue-600" />
            <h2 class="text-base font-black text-slate-700 uppercase tracking-widest">Kehadiran per Divisi</h2>
          </div>
          <div class="space-y-2.5">
            <div
              v-for="(div, i) in divisions" :key="div.name"
              class="flex items-center gap-4 div-row-enter"
              :style="`animation-delay:${500 + i*100}ms`"
            >
              <div class="w-24 text-base text-slate-700 shrink-0 font-bold">{{ div.name }}</div>
              <div class="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r bar-fill shimmer-bar"
                     :class="div.color"
                     :style="`--bar-w:${Math.round(div.hadir/div.total*100)}%; animation-delay:${600 + i*120}ms`" />
              </div>
              <div class="text-base font-black text-slate-800 tabular-nums shrink-0 w-20 text-right">
                {{ div.hadir }}<span class="text-slate-600 font-bold">/{{ div.total }}</span>
              </div>
              <div class="text-base font-bold text-slate-700 w-12 text-right shrink-0">
                {{ Math.round(div.hadir/div.total*100) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-span-4 flex flex-col gap-3 min-h-0">

        <!-- Top 5 -->
        <div class="light-card rounded-2xl p-4 flex-1 min-h-0">
          <div class="flex items-center gap-2 mb-3">
            <Award :size="18" class="text-amber-600 trophy-bounce" />
            <h2 class="text-base font-black text-slate-700 uppercase tracking-widest">Absensi Tercepat</h2>
          </div>
          <div class="space-y-2">
            <div
              v-for="(item, i) in topAttendance" :key="item.rank"
              class="inner-card flex items-center gap-3 rounded-xl px-3 py-2.5 group top-item-enter"
              :style="`animation-delay:${topVisible ? 400 + i*110 : 0}ms`"
              :class="topVisible ? '' : 'opacity-0'"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black border-2 shrink-0"
                   :class="rankColor(item.rank)">
                {{ item.rank }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-base font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                  {{ item.name }}
                </div>
                <div class="text-sm text-slate-600 font-semibold">{{ item.division }}</div>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-emerald-100 border-2 border-emerald-300
                          text-emerald-800 font-black text-base tabular-nums shrink-0 time-badge">
                {{ item.time }}
              </div>
            </div>
          </div>
        </div>

        <!-- Quote -->
        <div class="quote-card rounded-2xl p-5 relative overflow-hidden flex-shrink-0">
          <div class="absolute top-2 right-4 text-7xl font-black text-blue-400/40 leading-none select-none quote-mark-float">"</div>
          <div class="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-blue-100/60 blur-2xl pointer-events-none orb orb-1" />
          <Transition name="quote-fade" mode="out-in">
            <div :key="quoteIndex" class="relative z-10">
              <p class="text-slate-800 text-base leading-relaxed font-semibold italic">"{{ currentQuote.text }}"</p>
              <p class="text-blue-700 text-base mt-2 font-black tracking-wide">— {{ currentQuote.author }}</p>
            </div>
          </Transition>
        </div>

        <!-- Summary -->
        <div class="light-card rounded-2xl p-4 flex-shrink-0">
          <div class="grid grid-cols-2 gap-3">
            <div class="summary-item rounded-xl p-3 text-center bg-emerald-50 border-2 border-emerald-300 pop-in" style="animation-delay:0.7s">
              <div class="text-4xl font-black text-emerald-800 tabular-nums leading-none">93%</div>
              <div class="text-base text-emerald-700 mt-1 font-black">Kehadiran</div>
            </div>
            <div class="summary-item rounded-xl p-3 text-center bg-blue-50 border-2 border-blue-300 pop-in" style="animation-delay:0.85s">
              <div class="text-4xl font-black text-blue-800 tabular-nums leading-none">3</div>
              <div class="text-base text-blue-700 mt-1 font-black">Shift Aktif</div>
            </div>
            <div class="summary-item rounded-xl p-3 text-center bg-amber-50 border-2 border-amber-300 pop-in" style="animation-delay:1s">
              <div class="text-4xl font-black text-amber-800 tabular-nums leading-none">8</div>
              <div class="text-base text-amber-700 mt-1 font-black">Terlambat</div>
            </div>
            <div class="summary-item rounded-xl p-3 text-center bg-indigo-50 border-2 border-indigo-300 pop-in" style="animation-delay:1.15s">
              <div class="text-3xl font-black text-indigo-800 tabular-nums leading-none">245JT</div>
              <div class="text-base text-indigo-700 mt-1 font-black">Payroll</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TICKER -->
    <footer class="relative z-10 border-t-2 border-slate-300 px-6 py-3 flex items-center gap-4 flex-shrink-0"
            style="background:rgba(255,255,255,0.97);backdrop-filter:blur(20px)">
      <div class="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-lg border-2 border-blue-300 bg-blue-50">
        <div class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
        <span class="text-blue-800 text-base font-black tracking-widest uppercase">Info</span>
      </div>
      <div class="flex-1 overflow-hidden h-7 flex items-center relative">
        <Transition name="ticker-fade">
          <p v-if="tickerVisible" :key="tickerIndex"
             class="text-slate-800 text-base whitespace-nowrap font-semibold absolute">
            {{ ticker[tickerIndex] }}
          </p>
        </Transition>
      </div>
      <div class="text-slate-600 text-base font-bold shrink-0">HRM Pabrik Gula Modern © 2026</div>
    </footer>

  </div>
</template>

<style scoped>
/* ── Font ── */
.lobby-root { font-family:'DM Sans',system-ui,sans-serif; }

/* ── BG grid ── */
.bg-grid {
  background-image:
    linear-gradient(rgba(100,116,139,0.25) 1px, transparent 1px),
    linear-gradient(90deg,rgba(100,116,139,0.25) 1px,transparent 1px);
  background-size:48px 48px;
}

/* ── Orb float ── */
.orb { animation: orbFloat 10s ease-in-out infinite alternate; }
.orb-1 { animation-duration:12s; animation-delay:0s; }
.orb-2 { animation-duration:15s; animation-delay:-4s; }
.orb-3 { animation-duration:18s; animation-delay:-8s; }
.orb-4 { animation-duration:14s; animation-delay:-6s; }
@keyframes orbFloat {
  0%   { transform: translate(0,0) scale(1); }
  50%  { transform: translate(30px,-20px) scale(1.05); }
  100% { transform: translate(-20px,15px) scale(0.97); }
}

/* ── Scan line ── */
.scan-line { animation: scan 8s linear infinite; }
@keyframes scan { from { top:-2px; } to { top:100vh; } }

/* ── Header ── */
.header-bg { background:rgba(255,255,255,0.97); backdrop-filter:blur(24px); }
.header-shimmer {
  background: linear-gradient(105deg, transparent 40%, rgba(99,179,237,0.08) 50%, transparent 60%);
  background-size:200% 100%;
  animation: headerShimmer 6s linear infinite;
}
@keyframes headerShimmer { from{background-position:200% 0} to{background-position:-200% 0} }

/* ── Logo pulse ── */
.logo-icon {
  background:linear-gradient(135deg,#1d4ed8,#0ea5e9);
  box-shadow:0 0 24px rgba(29,78,216,0.3),inset 0 1px 0 rgba(255,255,255,0.3);
  animation: logoPulse 3s ease-in-out infinite;
}
@keyframes logoPulse {
  0%,100% { box-shadow:0 0 20px rgba(29,78,216,0.4); }
  50%      { box-shadow:0 0 40px rgba(14,165,233,0.7), 0 0 60px rgba(99,102,241,0.2); }
}

/* ── Clock glow ── */
.clock-glow { animation: clockGlow 2s ease-in-out infinite alternate; }
@keyframes clockGlow {
  from { text-shadow: none; }
  to   { text-shadow: 0 0 20px rgba(29,78,216,0.2); }
}

/* ── Live badge ── */
.live-badge-pulse { animation: livePulse 3s ease-in-out infinite; }
@keyframes livePulse {
  0%,100% { box-shadow:0 0 0 0 rgba(16,185,129,0); }
  50%      { box-shadow:0 0 0 6px rgba(16,185,129,0.15); }
}

/* ── Entrance: slide in ── */
.slide-in-left  { animation: slideLeft  0.7s cubic-bezier(0.22,1,0.36,1) both; }
.slide-in-right { animation: slideRight 0.7s cubic-bezier(0.22,1,0.36,1) both; }
.fade-in-down   { animation: fadeDown   0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
@keyframes slideLeft  { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideRight { from{opacity:0;transform:translateX(30px)}  to{opacity:1;transform:translateX(0)} }
@keyframes fadeDown   { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }

/* ── Stat cards entrance ── */
.stat-hidden { opacity:0; transform:translateY(24px) scale(0.97); }
.stat-visible { animation: statPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes statPop {
  from { opacity:0; transform:translateY(24px) scale(0.95); }
  to   { opacity:1; transform:translateY(0)    scale(1); }
}

/* ── Section entrance ── */
.section-hidden  { opacity:0; transform:translateY(20px); }
.section-visible { animation: sectionIn 0.7s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes sectionIn {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ── Shift card entrance ── */
.shift-card-enter { animation: shiftIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes shiftIn {
  from { opacity:0; transform:translateY(20px) scale(0.96); }
  to   { opacity:1; transform:translateY(0)    scale(1); }
}

/* ── Division row entrance ── */
.div-row-enter { animation: rowIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes rowIn {
  from { opacity:0; transform:translateX(-16px); }
  to   { opacity:1; transform:translateX(0); }
}

/* ── Top item entrance ── */
.top-item-enter { animation: topIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes topIn {
  from { opacity:0; transform:translateX(24px); }
  to   { opacity:1; transform:translateX(0); }
}

/* ── Pop in (summary cards) ── */
.pop-in { animation: popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes popIn {
  from { opacity:0; transform:scale(0.8); }
  to   { opacity:1; transform:scale(1); }
}

/* ── Rate bar fill + shimmer ── */
.rate-fill-anim {
  animation: rateFill 2s cubic-bezier(0.22,1,0.36,1) 0.5s both;
  width:0;
}
@keyframes rateFill { to { width:93%; } }

/* ── Rate number ── */
.rate-num { animation: rateNumIn 0.5s ease 0.4s both; }
@keyframes rateNumIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }

/* ── Progress bar fill ── */
.bar-fill {
  width:0;
  animation: barFill 1.6s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes barFill { to { width: var(--bar-w,0%); } }

/* ── Shimmer on bars ── */
.shimmer-bar {
  background-size:200% 100%;
  animation:
    barFill    1.6s cubic-bezier(0.22,1,0.36,1) both,
    barShimmer 3s   linear 2s infinite;
}
@keyframes barShimmer {
  0%   { background-position:200%  0; }
  100% { background-position:-200% 0; }
}

/* ── Card hover + shine ── */
.stat-card {
  backdrop-filter:blur(16px);
  box-shadow:0 1px 4px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.06);
  transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
.stat-card:hover {
  transform:translateY(-5px) scale(1.02);
  box-shadow:0 12px 32px rgba(0,0,0,0.12);
}
.card-shine {
  background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.5) 50%,transparent 60%);
  background-size:200% 100%;
  background-position:200% 0;
  transition:background-position 0.5s ease;
}
.stat-card:hover .card-shine { background-position:-200% 0; }

/* ── Light card ── */
.light-card {
  background:rgba(255,255,255,0.97);
  border:2px solid rgba(100,116,139,0.22);
  backdrop-filter:blur(20px);
  box-shadow:0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.06);
  transition:box-shadow 0.3s ease,border-color 0.3s ease,transform 0.3s ease;
}
.light-card:hover {
  box-shadow:0 4px 12px rgba(0,0,0,0.09),0 12px 32px rgba(0,0,0,0.08);
  border-color:rgba(100,116,139,0.38);
}

/* ── Inner card ── */
.inner-card {
  background:rgba(241,245,249,0.97);
  border:1.5px solid rgba(100,116,139,0.22);
  transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
.inner-card:hover {
  background:#fff;
  border-color:rgba(29,78,216,0.25);
  box-shadow:0 4px 16px rgba(29,78,216,0.1);
  transform:translateY(-2px);
}

/* ── Light button ── */
.light-btn {
  background:rgba(255,255,255,0.9);
  border:2px solid rgba(100,116,139,0.3);
  transition:all 0.2s ease;
}
.light-btn:hover {
  background:#fff;
  border-color:rgba(100,116,139,0.5);
  box-shadow:0 2px 8px rgba(0,0,0,0.1);
  transform:scale(1.05);
}

/* ── Icon animations ── */
.icon-bounce-in { animation: iconBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes iconBounce { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }

.spin-icon { animation: spinOnce 1s cubic-bezier(0.34,1.56,0.64,1) 0.5s both; }
@keyframes spinOnce { from{transform:rotate(-180deg) scale(0)} to{transform:rotate(0deg) scale(1)} }

.trending-bounce { animation: trendBounce 2s ease-in-out infinite; }
@keyframes trendBounce {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-3px); }
}

.trophy-bounce { animation: trophyWiggle 3s ease-in-out infinite; }
@keyframes trophyWiggle {
  0%,100% { transform:rotate(0); }
  20%      { transform:rotate(-8deg); }
  40%      { transform:rotate(8deg); }
  60%      { transform:rotate(-4deg); }
  80%      { transform:rotate(4deg); }
}

/* ── Time badge ── */
.time-badge { animation: timePing 4s ease-in-out infinite; }
@keyframes timePing {
  0%,90%,100% { box-shadow:0 0 0 0 rgba(16,185,129,0); }
  50%          { box-shadow:0 0 0 4px rgba(16,185,129,0.2); }
}

/* ── Quote card ── */
.quote-card {
  background:linear-gradient(135deg,#dbeafe,#e0f2fe);
  border:2px solid rgba(29,78,216,0.28);
  box-shadow:0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(29,78,216,0.1);
  animation: quoteCardFloat 6s ease-in-out infinite;
}
@keyframes quoteCardFloat {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-4px); }
}
.quote-mark-float { animation: markFloat 5s ease-in-out infinite alternate; }
@keyframes markFloat {
  from { transform:translateY(0)   rotate(-3deg); opacity:0.3; }
  to   { transform:translateY(8px) rotate(3deg);  opacity:0.5; }
}

/* ── Summary item ── */
.summary-item {
  transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
.summary-item:hover {
  transform:translateY(-4px) scale(1.03);
  box-shadow:0 8px 20px rgba(0,0,0,0.1);
}

/* ── Quote transition ── */
.quote-fade-enter-active,.quote-fade-leave-active { transition:all 0.6s cubic-bezier(0.22,1,0.36,1); }
.quote-fade-enter-from  { opacity:0; transform:translateY(12px) scale(0.98); }
.quote-fade-leave-to    { opacity:0; transform:translateY(-12px) scale(0.98); }

/* ── Ticker transition ── */
.ticker-fade-enter-active,.ticker-fade-leave-active { transition:all 0.45s cubic-bezier(0.22,1,0.36,1); }
.ticker-fade-enter-from  { opacity:0; transform:translateX(30px); }
.ticker-fade-leave-to    { opacity:0; transform:translateX(-30px); }
</style>