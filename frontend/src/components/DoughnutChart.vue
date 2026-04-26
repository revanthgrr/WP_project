<template>
  <Doughnut :data="chartData" :options="chartOptions" :plugins="[ChartDataLabels]" />
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

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
        label: (ctx) => {
          const value = ctx.parsed;
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return ` ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
        },
      },
    },
    datalabels: {
      color: '#fff',
      font: { weight: 'bold', size: 12 },
      formatter: (value, ctx) => {
        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        if (total === 0) return null;
        const percentage = Math.round((value / total) * 100);
        return percentage > 5 ? `${percentage}%` : null; // Hide if slice is too small
      },
    },
  },
}
</script>
