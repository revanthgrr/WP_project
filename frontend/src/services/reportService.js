// services/reportService.js
import api from './api'
export default {
  getMonthly:         (params) => api.get('/reports/monthly', { params }),
  getYearly:          ()       => api.get('/reports/yearly'),
  getCategorySummary: (params) => api.get('/reports/category-summary', { params }),
  getTrend:           (params) => api.get('/reports/trend', { params }),
  getDashboardSummary:(params) => api.get('/dashboard/summary', { params }),
}
