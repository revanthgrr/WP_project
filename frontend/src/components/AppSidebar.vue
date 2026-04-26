<template>
  <aside class="app-sidebar" :class="{ open: uiStore.sidebarOpen }">
    <!-- Logo -->
    <div class="sidebar-logo px-4 py-4 d-flex align-items-center gap-3">
      <div class="logo-icon">💰</div>
      <span class="logo-text">ExpenseIQ</span>
    </div>

    <!-- User info -->
    <div class="sidebar-user px-4 pb-3">
      <div class="d-flex align-items-center gap-3">
        <div class="user-avatar">{{ initials }}</div>
        <div class="overflow-hidden">
          <div class="user-name text-truncate">{{ authStore.user?.name }}</div>
          <div class="user-email text-truncate">{{ authStore.user?.email }}</div>
        </div>
      </div>
    </div>

    <hr class="sidebar-divider" />

    <!-- Navigation -->
    <nav class="sidebar-nav px-3 py-2">
      <a
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
        @click.prevent="navigate(item.path)"
      >
        <i :class="['bi', item.icon]"></i>
        <span>{{ item.label }}</span>
      </a>
    </nav>

    <div class="mt-auto px-3 pb-4">
      <hr class="sidebar-divider" />
      <button class="nav-item w-100 border-0 bg-transparent" @click="handleLogout">
        <i class="bi bi-box-arrow-right"></i>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useUiStore   } from '@/store/uiStore'

const authStore = useAuthStore()
const uiStore   = useUiStore()
const router    = useRouter()

const initials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const navItems = [
  { path: '/dashboard',    icon: 'bi-grid-1x2-fill',   label: 'Dashboard'     },
  { path: '/transactions', icon: 'bi-arrow-left-right', label: 'Transactions'  },
  { path: '/budget',       icon: 'bi-pie-chart-fill',   label: 'Budget'        },
  { path: '/reports',      icon: 'bi-bar-chart-fill',   label: 'Reports'       },
]

const navigate = (path) => {
  router.push(path)
  uiStore.closeSidebar()
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar-logo {
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.logo-icon {
  font-size: 1.75rem;
  line-height: 1;
}
.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}
.sidebar-user {
  padding-top: 1rem;
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-name  { font-size: 0.875rem; font-weight: 600; color: #f1f5f9; }
.user-email { font-size: 0.72rem;  color: #64748b; }
.sidebar-divider { border-color: rgba(255,255,255,0.07); margin: 0.5rem 1rem; }
.sidebar-nav { display: flex; flex-direction: column; gap: 2px; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.18s ease;
  cursor: pointer;
}
.nav-item i { font-size: 1.05rem; width: 20px; flex-shrink: 0; }
.nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: #f1f5f9;
  transform: translateX(2px);
}
.nav-item.active {
  background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(99,102,241,0.2));
  color: #818cf8;
  border-left: 3px solid #6366f1;
}
.mt-auto { margin-top: auto; }
</style>
