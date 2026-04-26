<template>
  <div class="fade-in">
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h2 class="h4 fw-bold mb-0">Reports & Analytics</h2>
        <p class="text-muted text-sm mb-0">Deep dive into your finances</p>
      </div>
      <div class="d-flex gap-2">
        <input type="month" v-model="selectedMonth" class="form-control form-control-sm"
               style="width:160px" @change="loadAllData" />
      </div>
    </div>

    <div class="row g-4 mb-4">
      <!-- Monthly bar chart -->
      <div class="col-lg-8">
        <div class="card h-100">
          <div class="card-header">
            <i class="bi bi-bar-chart me-2 text-primary"></i>Monthly Income vs Expenses — {{ currentYear }}
          </div>
          <div class="card-body" style="height:300px">
            <BarChart v-if="monthlyData.length" :months="monthlyData" />
            <div v-else class="text-center text-muted py-5">
              <div class="spinner-border text-primary"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category pie -->
      <div class="col-lg-4">
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
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import reportService from '@/services/reportService'
import BarChart      from '@/components/BarChart.vue'
import DoughnutChart from '@/components/DoughnutChart.vue'
import { getLocalISOMonth } from '@/utils/dateUtils'

const selectedMonth = ref(getLocalISOMonth())
const currentYear = computed(() => selectedMonth.value.split('-')[0])

const monthlyData   = ref([])
const catSummaryRaw = ref([])
const catSummary    = computed(() =>
  catSummaryRaw.value
    .filter(d => d._id.type === 'expense')
    .map(d => ({ name: d.category?.name, color: d.category?.color || '#6366f1', total: d.total }))
)

const loadReports = async () => {
  const monthly = await reportService.getMonthly({ year: currentYear.value })
  monthlyData.value = monthly.data.data
}

const loadCategorySummary = async () => {
  const { data } = await reportService.getCategorySummary({ month: selectedMonth.value })
  catSummaryRaw.value = data.data
}

const loadAllData = async () => {
  await Promise.all([loadReports(), loadCategorySummary()])
}

onMounted(loadAllData)
</script>

<style scoped>
.cat-dot { width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0; }
</style>
