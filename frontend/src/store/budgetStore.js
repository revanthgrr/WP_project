// store/budgetStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import budgetService from '@/services/budgetService'
import { getLocalISOMonth } from '@/utils/dateUtils'

export const useBudgetStore = defineStore('budget', () => {
  const budgets = ref([])
  const loading = ref(false)
  const currentMonth = ref(getLocalISOMonth())

  const fetch = async (month) => {
    loading.value = true
    if (month) currentMonth.value = month
    try {
      const { data } = await budgetService.getAll({ month: currentMonth.value })
      budgets.value = data.data
    } finally {
      loading.value = false
    }
  }

  const create = async (payload) => {
    const { data } = await budgetService.create(payload)
    budgets.value.push(data.data)
    return data.data
  }

  const update = async (id, payload) => {
    const { data } = await budgetService.update(id, payload)
    const idx = budgets.value.findIndex(b => b._id === id)
    if (idx !== -1) budgets.value[idx] = data.data
    return data.data
  }

  const remove = async (id) => {
    await budgetService.remove(id)
    budgets.value = budgets.value.filter(b => b._id !== id)
  }

  return { budgets, loading, currentMonth, fetch, create, update, remove }
})
