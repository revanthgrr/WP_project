<template>
  <div class="summary-card card border-0" :style="cardStyle">
    <div class="d-flex align-items-start justify-content-between mb-3">
      <div class="icon-wrapper" :style="iconStyle">
        <i :class="['bi', icon]"></i>
      </div>
      <span v-if="trend !== undefined" :class="['badge', trend >= 0 ? 'bg-income-soft' : 'bg-expense-soft']" style="font-size:.72rem">
        <i :class="['bi', trend >= 0 ? 'bi-arrow-up' : 'bi-arrow-down']"></i>
        {{ Math.abs(trend) }}%
      </span>
    </div>
    <div class="card-value">{{ formattedValue }}</div>
    <div class="card-label text-sm mt-1" :style="{ color: labelColor }">{{ label }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label:     { type: String,  required: true },
  value:     { type: Number,  default: 0 },
  icon:      { type: String,  default: 'bi-currency-rupee' },
  color:     { type: String,  default: '#6366f1' },
  textColor: { type: String,  default: '#ffffff' },
  trend:     { type: Number,  default: undefined },
  currency:  { type: String,  default: '₹' },
})

const cardStyle = computed(() => ({
  background: `linear-gradient(135deg, ${props.color} 0%, ${props.color}cc 100%)`,
  color: props.textColor,
}))
const iconStyle = computed(() => ({
  background: 'rgba(255,255,255,0.2)',
  color: props.textColor,
}))
const labelColor = computed(() => `${props.textColor}cc`)

const formattedValue = computed(() => {
  const abs = Math.abs(props.value)
  if (abs >= 100000) return `${props.currency}${(abs/100000).toFixed(2)}L`
  if (abs >= 1000)   return `${props.currency}${(abs/1000).toFixed(1)}K`
  return `${props.currency}${abs.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
})
</script>

<style scoped>
.card-value {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.card-label { font-weight: 500; opacity: 0.85; }
</style>
