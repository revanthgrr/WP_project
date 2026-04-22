<template>
  <div class="fade-in">
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h2 class="h4 fw-bold mb-0">Budget Manager</h2>
        <p class="text-muted text-sm mb-0">Track your monthly spending limits</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <input type="month" v-model="selectedMonth" class="form-control form-control-sm"
               style="width:160px" @change="budgetStore.fetch(selectedMonth)" />
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#budgetModal" @click="editTarget = null">
          <i class="bi bi-plus-lg me-1"></i>Set Budget
        </button>
      </div>
    </div>

    <!-- Summary row -->
    <div class="row g-3 mb-4">
      <div class="col-sm-4">
        <div class="card text-center py-3">
          <div class="fw-bold h5 mb-0 text-primary">{{ budgetStore.budgets.length }}</div>
          <div class="text-muted text-sm">Active Budgets</div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="card text-center py-3">
          <div class="fw-bold h5 mb-0 text-expense">{{ overBudgetCount }}</div>
          <div class="text-muted text-sm">Over Budget</div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="card text-center py-3">
          <div class="fw-bold h5 mb-0 text-income">₹{{ totalRemaining.toLocaleString('en-IN') }}</div>
          <div class="text-muted text-sm">Total Remaining</div>
        </div>
      </div>
    </div>

    <!-- Over-budget alert -->
    <div v-if="overBudgetCount > 0" class="alert alert-danger d-flex align-items-center gap-2 mb-4">
      <i class="bi bi-exclamation-triangle-fill fs-5"></i>
      <span>You have <strong>{{ overBudgetCount }}</strong> budget(s) that exceeded their limit this month!</span>
    </div>

    <!-- Budget cards grid -->
    <div v-if="budgetStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="budgetStore.budgets.length === 0" class="text-center py-5">
      <i class="bi bi-pie-chart display-4 text-muted d-block mb-3 opacity-25"></i>
      <h5 class="fw-semibold">No budgets set</h5>
      <p class="text-muted text-sm">Set monthly spending limits to track your finances.</p>
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#budgetModal" @click="editTarget = null">Set your first budget</button>
    </div>

    <div v-else class="row g-3">
      <div v-for="budget in budgetStore.budgets" :key="budget._id" class="col-md-6 col-lg-4">
        <div class="position-relative">
          <BudgetProgressCard :budget="budget" />
          <div class="budget-actions position-absolute top-0 end-0 p-2 d-flex gap-1">
            <button class="btn btn-xs btn-outline-primary" data-bs-toggle="modal" data-bs-target="#budgetModal" @click="editTarget = budget">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-xs btn-outline-danger" @click="handleDelete(budget._id)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <BudgetModal modal-id="budgetModal" :edit-data="editTarget"
                 @saved="budgetStore.fetch(selectedMonth)" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBudgetStore }   from '@/store/budgetStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useUiStore }       from '@/store/uiStore'
import BudgetProgressCard   from '@/components/BudgetProgressCard.vue'
import BudgetModal          from '@/components/BudgetModal.vue'
import { getLocalISOMonth } from '@/utils/dateUtils'

const budgetStore   = useBudgetStore()
const categoryStore = useCategoryStore()
const uiStore       = useUiStore()

const selectedMonth = ref(getLocalISOMonth())
const editTarget    = ref(null)

const overBudgetCount = computed(() => budgetStore.budgets.filter(b => b.isOverBudget).length)
const totalRemaining  = computed(() =>
  budgetStore.budgets.reduce((s, b) => s + Math.max(0, b.limit - b.spent), 0))

const handleDelete = async (id) => {
  if (!confirm('Delete this budget?')) return
  try {
    await budgetStore.remove(id)
    uiStore.addToast('Budget removed', 'success')
  } catch {
    uiStore.addToast('Failed to delete', 'error')
  }
}

onMounted(async () => {
  await categoryStore.fetch()
  await budgetStore.fetch(selectedMonth.value)

  // Notify over-budget
  if (overBudgetCount.value > 0) {
    uiStore.addToast(`⚠️ ${overBudgetCount.value} budget(s) exceeded!`, 'warning')
  }
})
</script>

<style scoped>
.btn-xs { padding: 0.15rem 0.4rem; font-size: .7rem; }
</style>
