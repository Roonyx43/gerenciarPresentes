<!-- frontend/src/components/TopContributors.vue -->
<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold ">Top Contribuidores</h2>
        <p class="text-sm text-gray-500">Exibe apenas contribuições marcadas como “Pago”.</p>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Filtrar por presente:</label>
        <select
          v-model="selectedGiftId"
          @change="loadData"
          class="border-2 border-blue-300 rounded-sm px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 transition"
        >
          <option :value="null">Todos</option>
          <option v-for="g in gifts" :key="g.id" :value="g.id">
            {{ g.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Gráfico -->
    <div class="bg-white/90 backdrop-blur-md rounded-sm border-2 border-blue-300 shadow-sm p-10">
      <div class="h-72 relative">
        <Bar
          v-if="chartData && chartData.labels.length"
          :data="chartData"
          :options="chartOptions"
          class="w-full h-full"
        />
        <div v-else class="text-center text-gray-500 pt-20">Nenhum dado disponível</div>
      </div>
    </div>

    <!-- Ranking -->
    <div class="bg-white/90 backdrop-blur-md rounded-sm border-2 border-blue-300 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
      <h3 class="text-lg font-semibold mb-4 text-gray-800">Ranking</h3>

      <ol class="divide-y divide-gray-200">
        <li
          v-for="(p, idx) in topPeople"
          :key="p.padrinho_name"
          class="flex items-center justify-between py-3"
        >
          <div class="flex items-center gap-3">
            <span
              class="w-7 text-center font-semibold"
              :class="{
                'text-amber-500': idx === 0,
                'text-gray-500': idx === 1,
                'text-yellow-700': idx === 2,
                'text-gray-400': idx > 2
              }"
            >
              {{ idx + 1 }}°
            </span>
            <div class="flex flex-col">
              <span class="font-medium text-gray-800 leading-none">{{ p.padrinho_name }}</span>
              <span class="text-xs text-gray-500 leading-none">{{ p.contributions_count }} contribuições</span>
            </div>
          </div>
          <div class="font-semibold text-emerald-700 text-sm sm:text-base">
            R$ {{ formatMoney(p.total_amount) }}
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { getTopContributors, listGifts } from '../api.js'

// registra módulos do Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const gifts = ref([])
const selectedGiftId = ref(null)
const rawData = ref([])

const topPeople = computed(() =>
  rawData.value.slice().sort((a, b) => b.total_amount - a.total_amount)
)

const chartData = computed(() => {
  if (!rawData.value?.length) return { labels: [], datasets: [] }

  return {
    labels: rawData.value.map(r => r.padrinho_name),
    datasets: [
      {
        label: 'Total contribuído (R$)',
        data: rawData.value.map(r => r.total_amount),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `R$ ${formatMoney(ctx.parsed.y)}`
      }
    }
  },
  scales: {
    y: {
      ticks: {
        callback: (v) => `R$ ${formatMoney(v)}`
      },
      grid: { color: 'rgba(0,0,0,0.05)' }
    },
    x: {
      grid: { display: false }
    }
  }
}

function formatMoney(n) {
  return Number(n).toFixed(2).replace('.', ',')
}

async function loadData() {
  const data = await getTopContributors({
    giftId: selectedGiftId.value || null,
    limit: 10
  })
  rawData.value = data || []
}

onMounted(async () => {
  gifts.value = await listGifts()
  await loadData()
})
</script>

<style scoped>
:deep(canvas) {
  min-height: 260px;
}
</style>
