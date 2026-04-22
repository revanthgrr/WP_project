<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  breakdown: { type: Array, default: () => [] },
})

const chartData = computed(() => ({
  labels: props.breakdown.map(b => b.name),
  datasets: [{
    data: props.breakdown.map(b => b.total),
    backgroundColor: props.breakdown.map(b => b.color || '#6366f1'),
    borderWidth: 2,
    borderColor: 'transparent',
    hoverOffset: 8,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 16,
        font: { family: 'Inter', size: 12 },
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ₹${ctx.parsed.toLocaleString('en-IN')}`,
      },
    },
  },
}
</script>
