<template>
  <div class="fade-in">
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h2 class="h4 fw-bold mb-0">Reports & Analytics</h2>
        <p class="text-muted text-sm mb-0">Deep dive into your finances</p>
      </div>
      <div class="d-flex gap-2">
        <select v-model="selectedYear" class="form-select form-select-sm" style="width:120px"
                @change="loadReports">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <input type="month" v-model="selectedMonth" class="form-control form-control-sm"
               style="width:160px" @change="loadCategorySummary" />
      </div>
    </div>

    <!-- Monthly bar chart -->
    <div class="card mb-4">
      <div class="card-header">
        <i class="bi bi-bar-chart me-2 text-primary"></i>Monthly Income vs Expenses — {{ selectedYear }}
      </div>
      <div class="card-body" style="height:300px">
        <BarChart v-if="monthlyData.length" :months="monthlyData" />
        <div v-else class="text-center text-muted py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <!-- Category pie -->
      <div class="col-lg-5">
        <div class="card h-100">
          <div class="card-header">
            <i class="bi bi-pie-chart me-2 text-primary"></i>
            Category Breakdown — {{ selectedMonth }}
          </div>
          <div class="card-body">
            <div v-if="catSummary.length" style="height:280px">
              <DoughnutChart :breakdown="catSummary" />
            </div>
            <div v-else class="text-center text-muted py-5">
              <i class="bi bi-pie-chart display-4 d-block mb-2 opacity-25"></i>
              No expense data
            </div>
          </div>
        </div>
      </div>

      <!-- Category table -->
      <div class="col-lg-7">
        <div class="card h-100">
          <div class="card-header">
            <i class="bi bi-list-ul me-2 text-primary"></i>Category Breakdown Details
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th class="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in catSummaryRaw" :key="item._id.categoryId">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <span class="cat-dot" :style="{ background: item.category?.color }"></span>
                        {{ item.category?.name }}
                      </div>
                    </td>
                    <td>
                      <span :class="['badge', item._id.type === 'income' ? 'bg-income-soft' : 'bg-expense-soft']">
                        {{ item._id.type }}
                      </span>
                    </td>
                    <td :class="['text-end fw-semibold', item._id.type === 'income' ? 'text-income' : 'text-expense']">
                      ₹{{ item.total.toLocaleString('en-IN') }}
                    </td>
                  </tr>
                  <tr v-if="!catSummaryRaw.length">
                    <td colspan="3" class="text-center text-muted py-4">No data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Yearly chart -->
    <div class="card">
      <div class="card-header">
        <i class="bi bi-calendar3 me-2 text-primary"></i>Year-over-Year Comparison
      </div>
      <div class="card-body" style="height:280px">
        <BarChart v-if="yearlyData.length" :months="yearlyData" />
        <div v-else class="text-center text-muted py-5">
          <i class="bi bi-bar-chart display-4 d-block mb-2 opacity-25"></i>
          Not enough data
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import reportService from '@/services/reportService'
import BarChart      from '@/components/BarChart.vue'
import DoughnutChart from '@/components/DoughnutChart.vue'
import { getLocalISOMonth } from '@/utils/dateUtils'

const now = new Date()
const selectedYear  = ref(now.getFullYear())
const selectedMonth = ref(getLocalISOMonth())
const years = computed(() => {
  const y = now.getFullYear()
  return [y - 2, y - 1, y, y + 1]
})

const monthlyData   = ref([])
const yearlyData    = ref([])
const catSummaryRaw = ref([])
const catSummary    = computed(() =>
  catSummaryRaw.value
    .filter(d => d._id.type === 'expense')
    .map(d => ({ name: d.category?.name, color: d.category?.color || '#6366f1', total: d.total }))
)

const loadReports = async () => {
  const [monthly, yearly] = await Promise.all([
    reportService.getMonthly({ year: selectedYear.value }),
    reportService.getYearly(),
  ])
  monthlyData.value = monthly.data.data
  yearlyData.value  = yearly.data.data.map(d => ({
    label: String(d.year), income: d.income || 0, expense: d.expense || 0,
  }))
}

const loadCategorySummary = async () => {
  const { data } = await reportService.getCategorySummary({ month: selectedMonth.value })
  catSummaryRaw.value = data.data
}

onMounted(async () => {
  await Promise.all([loadReports(), loadCategorySummary()])
})
</script>

<style scoped>
.cat-dot { width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0; }
</style>
