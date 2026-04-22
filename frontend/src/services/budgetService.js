// services/budgetService.js
import api from './api'
export default {
  getAll:  (params)    => api.get('/budgets', { params }),
  create:  (data)      => api.post('/budgets', data),
  update:  (id, data)  => api.put(`/budgets/${id}`, data),
  remove:  (id)        => api.delete(`/budgets/${id}`),
}
