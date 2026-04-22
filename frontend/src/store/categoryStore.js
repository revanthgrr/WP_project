// store/categoryStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import categoryService from '@/services/categoryService'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const loading    = ref(false)

  const expenseCategories = computed(() =>
    categories.value.filter(c => c.type === 'expense' || c.type === 'both'))
  const incomeCategories  = computed(() =>
    categories.value.filter(c => c.type === 'income'  || c.type === 'both'))

  const fetch = async () => {
    loading.value = true
    try {
      const { data } = await categoryService.getAll()
      categories.value = data.data
    } finally {
      loading.value = false
    }
  }

  const create = async (payload) => {
    const { data } = await categoryService.create(payload)
    categories.value.push(data.data)
    return data.data
  }

  const update = async (id, payload) => {
    const { data } = await categoryService.update(id, payload)
    const idx = categories.value.findIndex(c => c._id === id)
    if (idx !== -1) categories.value[idx] = data.data
    return data.data
  }

  const remove = async (id) => {
    await categoryService.remove(id)
    categories.value = categories.value.filter(c => c._id !== id)
  }

  const getById = (id) => categories.value.find(c => c._id === id)

  return { categories, loading, expenseCategories, incomeCategories,
           fetch, create, update, remove, getById }
})
