<template>
  <div class="budget-card card p-3 mb-3" :class="cardStatus">
    <div class="d-flex align-items-start justify-content-between mb-2">
      <div class="d-flex align-items-center gap-2">
        <span class="category-icon" style="background: #e0e7ff; color: #4f46e5;">
          <i class="bi bi-wallet2"></i>
        </span>
        <div>
          <div class="fw-semibold" style="font-size:.9rem">Monthly Budget</div>
          <div class="text-xs text-muted">{{ budget.month }}</div>
        </div>
      </div>
      <div class="text-end d-flex flex-column align-items-end">
        <div v-if="$slots.actions" class="mb-1">
          <slot name="actions"></slot>
        </div>
        <div class="fw-bold" :class="budget.isOverBudget ? 'text-expense' : 'text-primary'">
          ₹{{ budget.spent?.toLocaleString('en-IN') }}
        </div>
        <div class="text-xs text-muted">of ₹{{ budget.limit?.toLocaleString('en-IN') }}</div>
      </div>
    </div>

    <div class="progress mb-1">
      <div
        class="progress-bar"
        :class="progressClass"
        :style="{ width: `${budget.percentage}%` }"
      ></div>
    </div>

    <div class="d-flex justify-content-between align-items-center">
      <span class="text-xs" :class="budget.isOverBudget ? 'text-expense' : 'text-muted'">
        <i v-if="budget.isOverBudget" class="bi bi-exclamation-triangle-fill me-1"></i>
        {{ budget.isOverBudget ? 'Over budget!' : `${budget.percentage}% used` }}
      </span>
      <span class="text-xs" :class="budget.isOverBudget ? 'text-expense' : 'text-muted'">
        {{ budget.isOverBudget
            ? `₹${(budget.spent - budget.limit).toLocaleString('en-IN')} over`
            : `₹${(budget.limit - budget.spent).toLocaleString('en-IN')} left` }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ budget: { type: Object, required: true } })

const cardStatus = computed(() => ({
  'over-budget': props.budget.isOverBudget,
  'near-limit':  !props.budget.isOverBudget && props.budget.percentage >= 80,
}))
const progressClass = computed(() => {
  if (props.budget.isOverBudget || props.budget.percentage >= 90) return 'bg-danger'
  if (props.budget.percentage >= 70) return 'bg-warning'
  return 'bg-success'
})
</script>

<style scoped>
.category-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
</style>
