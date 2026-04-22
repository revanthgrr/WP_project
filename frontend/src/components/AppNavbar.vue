<template>
  <header class="app-navbar d-flex align-items-center px-4 gap-3">
    <!-- Mobile hamburger -->
    <button class="btn btn-sm btn-outline-secondary d-lg-none border-0" @click="uiStore.toggleSidebar()">
      <i class="bi bi-list fs-5"></i>
    </button>

    <!-- Page title -->
    <h1 class="page-title mb-0">{{ pageTitle }}</h1>

    <div class="ms-auto d-flex align-items-center gap-3">
      <!-- Current date -->
      <span class="text-muted text-sm d-none d-md-block">{{ currentDate }}</span>

      <!-- Dark mode toggle -->
      <button
        class="btn btn-sm dark-toggle"
        :title="uiStore.darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="uiStore.toggleDarkMode()"
      >
        <i :class="['bi', uiStore.darkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill']"></i>
      </button>

      <!-- Notifications placeholder -->
      <div class="nav-user-avatar">{{ initials }}</div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute }     from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useUiStore   } from '@/store/uiStore'

const authStore = useAuthStore()
const uiStore   = useUiStore()
const route     = useRoute()

const pageMap = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/budget':       'Budget',
  '/reports':      'Reports',
}
const pageTitle = computed(() => pageMap[route.path] || 'ExpenseIQ')

const initials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const currentDate = computed(() =>
  new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
)
</script>

<style scoped>
.page-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}
.dark-toggle {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-hover);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;
}
.dark-toggle:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
.nav-user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
