<template>
  <div class="fade-in">
    <!-- Month selector -->
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h2 class="h4 fw-bold mb-0">Dashboard</h2>
        <p class="text-muted text-sm mb-0">Your financial overview</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <input type="month" v-model="selectedMonth" class="form-control form-control-sm" style="width:160px"
               @change="loadData" />
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#transactionModal">
          <i class="bi bi-plus-lg me-1"></i>Add
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Summary cards (Left Column) -->
      <div class="col-lg-4 d-flex flex-column gap-3">
        <SummaryCard label="Total Income" :value="summary.monthly.income"
                     icon="bi-arrow-down-circle-fill" color="#22c55e" />
        <SummaryCard label="Total Expenses" :value="summary.monthly.expense"
                     icon="bi-arrow-up-circle-fill" color="#ef4444" />
      </div>

      <!-- Recent Transactions (Right Column) -->
      <div class="col-lg-8">
        <div class="card h-100">
          <div class="card-header d-flex align-items-center justify-content-between">
            <span><i class="bi bi-clock-history me-2 text-primary"></i>Recent Transactions</span>
            <router-link to="/transactions" class="btn btn-sm btn-outline-primary">View all</router-link>
          </div>
          <div class="card-body p-0">
            <div v-if="summary.recentTransactions.length" class="list-group list-group-flush">
              <div v-for="tx in summary.recentTransactions" :key="tx._id"
                   class="list-group-item d-flex align-items-center gap-3 px-4 py-3"
                   style="background:transparent;border-color:var(--border-color)">
                <div class="tx-icon" :style="{ background: `${tx.categoryId?.color}20` }">
                  <i :class="['bi', tx.categoryId?.icon || 'bi-tag']"
                     :style="{ color: tx.categoryId?.color }"></i>
                </div>
                <div class="flex-grow-1 min-w-0">
                  <div class="fw-medium text-truncate" style="font-size:.875rem">
                    {{ tx.categoryId?.name || 'Uncategorised' }}
                  </div>
                  <div class="text-xs text-muted">{{ formatDate(tx.date) }}</div>
                </div>
                <div :class="['fw-bold', tx.type === 'income' ? 'text-income' : 'text-expense']">
                  {{ tx.type === 'income' ? '+' : '-' }}₹{{ tx.amount.toLocaleString('en-IN') }}
                </div>
              </div>
            </div>
            <div v-else class="text-center text-muted py-5">
              <i class="bi bi-inbox display-4 d-block mb-2 opacity-25"></i>
              No transactions yet
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Transaction Modal -->
    <TransactionModal modal-id="transactionModal" @saved="loadData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import reportService from '@/services/reportService'
import SummaryCard      from '@/components/SummaryCard.vue'
import TransactionModal from '@/components/TransactionModal.vue'
import { useCategoryStore } from '@/store/categoryStore'
import { getLocalISOMonth } from '@/utils/dateUtils'

const categoryStore  = useCategoryStore()
const selectedMonth  = ref(getLocalISOMonth())

const summary = ref({
  monthly: { income: 0, expense: 0, balance: 0 },
  allTime: { income: 0, expense: 0, balance: 0 },
  recentTransactions: [],
  categoryBreakdown: [],
})

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const loadData = async () => {
  const summaryRes = await reportService.getDashboardSummary({ month: selectedMonth.value })
  summary.value    = summaryRes.data.data
}

onMounted(async () => {
  await categoryStore.fetch()
  await loadData()
})
</script>

<style scoped>
.tx-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
</style>
