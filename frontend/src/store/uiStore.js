// store/uiStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen  = ref(false)
  const toasts       = ref([])

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), duration)
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }
  const closeSidebar  = () => { sidebarOpen.value = false }

  return { sidebarOpen, toasts, addToast, removeToast, toggleSidebar, closeSidebar }
})
