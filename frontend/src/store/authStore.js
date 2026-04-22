// store/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  const setAuth = (data) => {
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    setAuth(data)
    return data
  }

  const register = async (payload) => {
    const { data } = await authService.register(payload)
    setAuth(data)
    return data
  }

  const logout = () => {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const fetchMe = async () => {
    if (!token.value) return
    try {
      const { data } = await authService.getMe()
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch {
      logout()
    }
  }

  return { token, user, isAuthenticated, login, register, logout, fetchMe }
})
