<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps({
  months: { type: Array, default: () => [] }, // [{ label, income, expense }]
})

const chartData = computed(() => ({
  labels: props.months.map(m => m.label),
  datasets: [
    {
      label: 'Income',
      data: props.months.map(m => m.income),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 7,
    },
    {
      label: 'Expense',
      data: props.months.map(m => m.expense),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 7,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyleWidth: 10, padding: 16 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(148,163,184,0.1)' },
      ticks: { callback: v => `₹${(v/1000).toFixed(0)}K`, font: { family: 'Inter', size: 11 } },
    },
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter', size: 11 } },
    },
  },
}
</script>
