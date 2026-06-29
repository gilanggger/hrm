<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Eye, EyeOff, User, Lock, ShieldCheck, Sparkles,
  Activity, Database, Shield, Cpu,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ─── Form State ─── */
const username     = ref('')
const password     = ref('')
const remember     = ref(false)
const showPassword = ref(false)
const loading      = ref(false)

/* ─── Rotating Text ─── */
const currentText = ref(0)
const texts = ['Secure HR Management', 'Modern Employee System', 'Realtime Monitoring', 'Smart Payroll System']

/* ─── Stats Cards ─── */
const stats = [
  { icon: Activity, title: '24H',  subtitle: 'Monitoring'  },
  { icon: Database, title: 'HR',   subtitle: 'Management'  },
  { icon: Shield,   title: '100%', subtitle: 'Security'    },
  { icon: Cpu,      title: 'AI',   subtitle: 'Automation'  },
]

/* ─── Password Strength ─── */
const passwordStrength = computed(() => {
  const len = password.value.length
  if (len <= 3) return 25
  if (len <= 6) return 50
  if (len <= 9) return 75
  return 100
})

const strengthColor = computed(() => {
  if (passwordStrength.value <= 25) return 'bg-red-400'
  if (passwordStrength.value <= 50) return 'bg-yellow-400'
  if (passwordStrength.value <= 75) return 'bg-blue-400'
  return 'bg-emerald-400'
})

/* ─── Login Handler ─── */
const handleLogin = async () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    if (username.value === 'admin' && password.value === 'admin') {
      router.push('/dashboard')
    } else {
      alert('Username atau Password Salah')
    }
  }, 1500)
}

onMounted(() => {
  setInterval(() => {
    currentText.value = (currentText.value + 1) % texts.length
  }, 3000)
})
</script>

<template>
  <section class="relative h-screen overflow-hidden bg-[#0C1620] flex items-center justify-center px-4 py-4">

    <!-- Video BG -->
    <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover scale-110 animate-slowZoom">
      <source src="../assets/giling.mp4" type="video/mp4">
    </video>

    <!-- Overlays -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#06141B]/95 via-[#11212D]/90 to-[#253745]/95" />
    <div class="absolute inset-0 opacity-60 animate-gradientMove"
      style="background:linear-gradient(130deg,rgba(17,33,45,0.55),rgba(37,55,69,0.45),rgba(74,96,115,0.35),rgba(156,168,178,0.20),rgba(204,208,207,0.15));background-size:500% 500%;mix-blend-mode:screen;"
    />
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
    <div class="absolute top-[-200px] left-[-150px] w-[600px] h-[600px] bg-[#253745]/40 rounded-full blur-3xl animate-float" />
    <div class="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] bg-[#4A6073]/30 rounded-full blur-3xl animate-float2" />
    <div class="absolute inset-0 opacity-[0.05]"
      style="background-image:linear-gradient(rgba(255,255,255,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.12) 1px,transparent 1px);background-size:40px 40px;"
    />

    <!-- Container -->
    <div class="relative z-10 w-full max-w-7xl h-[92vh] rounded-[36px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div class="grid lg:grid-cols-2 h-full">

        <!-- Left Panel -->
        <div class="hidden lg:flex relative flex-col justify-between p-8 xl:p-12 bg-white/5 overflow-hidden">
          <div class="absolute inset-0 border border-white/10" />

          <div class="relative z-10">
            <div class="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#06141B] to-[#253745] flex items-center justify-center shadow-[0_0_40px_rgba(17,33,45,0.7)] border border-white/10 backdrop-blur-md animate-float">
              <ShieldCheck class="text-white" :size="46" />
            </div>

            <div class="mt-7 inline-flex items-center gap-2 bg-[#253745]/40 border border-[#9CA8B2]/20 px-4 py-2 rounded-full text-[#CCD0CF] text-sm backdrop-blur-md">
              <Sparkles :size="15" />
              Next Generation System
            </div>

            <h1 class="mt-5 text-5xl xl:text-6xl font-black leading-tight text-white">
              HRM
              <span class="bg-gradient-to-r from-[#CCD0CF] via-white to-[#9CA8B2] bg-clip-text text-transparent">SYSTEM</span>
            </h1>

            <div class="h-8 overflow-hidden mt-4">
              <transition name="slide-fade" mode="out-in">
                <p :key="texts[currentText]" class="text-[#CCD0CF] text-lg font-medium">{{ texts[currentText] }}</p>
              </transition>
            </div>

            <p class="mt-4 text-[#CCD0CF]/80 text-base leading-relaxed max-w-lg">
              Sistem Human Resource modern dengan keamanan tinggi, monitoring realtime, payroll otomatis, dan manajemen karyawan berbasis digital.
            </p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-4 mt-8 relative z-10">
            <div
              v-for="(item, index) in stats" :key="index"
              class="group relative bg-white/10 border border-white/10 rounded-3xl p-4 backdrop-blur-md overflow-hidden hover:-translate-y-2 hover:scale-[1.02] transition duration-500"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <component :is="item.icon" class="text-white mb-3" :size="28" />
              <h3 class="text-3xl font-black text-white">{{ item.title }}</h3>
              <p class="text-[#CCD0CF] text-sm mt-1">{{ item.subtitle }}</p>
            </div>
          </div>
        </div>

        <!-- Right Panel (Login Form) -->
        <div class="relative bg-[#CCD0CF]/95 backdrop-blur-xl px-6 py-6 sm:px-8 md:px-10 lg:px-12 xl:px-14 flex items-center overflow-hidden">
          <div class="absolute top-[-100px] right-[-100px] w-[220px] h-[220px] bg-[#9CA8B2] rounded-full blur-3xl opacity-40 animate-pulse" />

          <div class="relative z-10 w-full">
            <!-- Mobile Logo -->
            <div class="lg:hidden flex justify-center mb-6">
              <div class="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[#06141B] to-[#253745] flex items-center justify-center shadow-[0_0_40px_rgba(17,33,45,0.6)]">
                <ShieldCheck class="text-white" :size="36" />
              </div>
            </div>

            <!-- Header -->
            <div class="text-center lg:text-left">
              <p class="text-[#253745] font-semibold tracking-[4px] uppercase text-xs">Welcome Back</p>
              <h2 class="mt-2 text-4xl font-black text-[#06141B] leading-tight">Login Account</h2>
              <p class="mt-3 text-[#4A6073] text-sm leading-relaxed">Silakan login untuk mengakses sistem HRM perusahaan.</p>
            </div>

            <!-- Form -->
            <form class="mt-8 space-y-5" @submit.prevent="handleLogin">

              <!-- Username -->
              <div>
                <label class="block mb-2 text-sm font-bold text-[#11212D]">Username</label>
                <div class="relative">
                  <User class="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A6073] z-20" :size="18" />
                  <input
                    v-model="username" type="text" placeholder="Masukkan username"
                    class="w-full h-14 rounded-2xl border border-[#9CA8B2]/40 bg-white/70 pl-14 pr-5 text-[#06141B] outline-none backdrop-blur-md focus:border-[#253745] focus:ring-4 focus:ring-[#9CA8B2]/30 transition-all"
                  />
                </div>
              </div>

              <!-- Password -->
              <div>
                <label class="block mb-2 text-sm font-bold text-[#11212D]">Password</label>
                <div class="relative">
                  <Lock class="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A6073] z-20" :size="18" />
                  <input
                    v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Masukkan password"
                    class="w-full h-14 rounded-2xl border border-[#9CA8B2]/40 bg-white/70 pl-14 pr-16 text-[#06141B] outline-none backdrop-blur-md focus:border-[#253745] focus:ring-4 focus:ring-[#9CA8B2]/30 transition-all"
                  />
                  <button type="button" @click="showPassword = !showPassword" class="absolute right-5 top-1/2 -translate-y-1/2 text-[#4A6073] hover:text-[#06141B] transition z-20">
                    <Eye v-if="!showPassword" :size="20" />
                    <EyeOff v-else :size="20" />
                  </button>
                </div>
                <!-- Strength Bar -->
                <div class="mt-3 w-full h-2 rounded-full bg-[#9CA8B2]/30 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500" :class="strengthColor" :style="{ width: passwordStrength + '%' }" />
                </div>
              </div>

              <!-- Remember + Forgot -->
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label class="flex items-center gap-3 text-[#253745] text-sm">
                  <input v-model="remember" type="checkbox" class="w-4 h-4 rounded" />
                  Ingat Saya
                </label>
                <a href="#" class="text-sm font-semibold text-[#11212D] hover:text-[#253745] transition">Lupa Password?</a>
              </div>

              <!-- Submit -->
              <button
                type="submit" :disabled="loading"
                class="group relative w-full h-14 rounded-2xl overflow-hidden bg-gradient-to-r from-[#06141B] via-[#11212D] to-[#253745] text-white font-bold shadow-[0_0_30px_rgba(17,33,45,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000" />
                <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-[#06141B]">
                  <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
                <span v-else class="relative z-10">LOGIN SEKARANG</span>
              </button>
            </form>

            <!-- Footer -->
            <div class="mt-5 pt-4 border-t border-[#9CA8B2]/40 text-center lg:text-left">
              <p class="text-sm text-[#4A6073]">© 2026 HRM Pabrik Gula • Secure System</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-20px); }
}
@keyframes float2 {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50%       { transform: translateY(-30px) translateX(-20px); }
}
@keyframes slowZoom {
  0%   { transform: scale(1.05); }
  100% { transform: scale(1.15); }
}
@keyframes gradientMove {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.5s ease; }
.slide-fade-enter-from  { opacity: 0; transform: translateY(20px); }
.slide-fade-leave-to    { opacity: 0; transform: translateY(-20px); }
.animate-gradientMove { animation: gradientMove 12s ease infinite; }
.animate-float        { animation: float 6s ease-in-out infinite; }
.animate-float2       { animation: float2 8s ease-in-out infinite; }
.animate-slowZoom     { animation: slowZoom 20s linear infinite alternate; }
</style>
