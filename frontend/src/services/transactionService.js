// services/transactionService.js
import api from './api'
export default {
  getAll:     (params) => api.get('/transactions', { params }),
  getOne:     (id)     => api.get(`/transactions/${id}`),
  create:     (data)   => api.post('/transactions', data),
  update:     (id, data) => api.put(`/transactions/${id}`, data),
  remove:     (id)     => api.delete(`/transactions/${id}`),
  removeAll:  ()       => api.delete('/transactions'),
  exportCSV:  (params) => api.get('/transactions/export/csv', { params, responseType: 'blob' }),
  importFile: (file)   => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/transactions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
