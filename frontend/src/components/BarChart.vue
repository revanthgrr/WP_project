<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps({
  months: { type: Array, default: () => [] },
  title:  { type: String, default: '' },
})

const chartData = computed(() => ({
  labels: props.months.map(m => m.label || String(m.year || m.month)),
  datasets: [
    {
      label: 'Income',
      data: props.months.map(m => m.income),
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderRadius: 6,
      borderSkipped: false,
    },
    {
      label: 'Expense',
      data: props.months.map(m => m.expense),
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderRadius: 6,
      borderSkipped: false,
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
