// store/transactionStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import transactionService from '@/services/transactionService'
import { getLocalISODate } from '@/utils/dateUtils'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref([])
  const pagination   = ref({ page: 1, limit: 50, total: 0, pages: 1 })
  const loading      = ref(false)
  const filters      = ref({ type: '', categoryId: '', month: '', search: '' })

  const totalIncome  = computed(() =>
    transactions.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))
  const totalExpense = computed(() =>
    transactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
  const balance      = computed(() => totalIncome.value - totalExpense.value)

  const fetch = async (params = {}) => {
    loading.value = true
    try {
      const { data } = await transactionService.getAll({ ...filters.value, ...params })
      transactions.value = data.data
      pagination.value   = data.pagination
    } finally {
      loading.value = false
    }
  }

  const create = async (payload) => {
    const { data } = await transactionService.create(payload)
    transactions.value.unshift(data.data)
    return data.data
  }

  const update = async (id, payload) => {
    const { data } = await transactionService.update(id, payload)
    const idx = transactions.value.findIndex(t => t._id === id)
    if (idx !== -1) transactions.value[idx] = data.data
    return data.data
  }

  const remove = async (id) => {
    await transactionService.remove(id)
    transactions.value = transactions.value.filter(t => t._id !== id)
  }

  const exportCSV = async () => {
    const { data } = await transactionService.exportCSV(filters.value)
    const url  = URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href  = url
    link.download = `transactions_${getLocalISODate()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const removeAll = async () => {
    await transactionService.removeAll()
    transactions.value = []
    pagination.value = { page: 1, limit: 50, total: 0, pages: 1 }
  }

  const importFile = async (file) => {
    const { data } = await transactionService.importFile(file)
    return data
  }

  return { transactions, pagination, loading, filters, totalIncome, totalExpense, balance,
           fetch, create, update, remove, removeAll, exportCSV, importFile }
})
