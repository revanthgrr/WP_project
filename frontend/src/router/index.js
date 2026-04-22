/**
 * router/index.js — Vue Router configuration
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

// Lazy-loaded views
const LoginView      = () => import('@/views/LoginView.vue')
const RegisterView   = () => import('@/views/RegisterView.vue')
const DashboardView  = () => import('@/views/DashboardView.vue')
const TransactionsView = () => import('@/views/TransactionsView.vue')
const BudgetView     = () => import('@/views/BudgetView.vue')
const ReportsView    = () => import('@/views/ReportsView.vue')

const routes = [
  { path: '/',             redirect: '/dashboard' },
  { path: '/login',        component: LoginView,    meta: { guest: true  } },
  { path: '/register',     component: RegisterView, meta: { guest: true  } },
  { path: '/dashboard',    component: DashboardView,    meta: { requiresAuth: true } },
  { path: '/transactions', component: TransactionsView, meta: { requiresAuth: true } },
  { path: '/budget',       component: BudgetView,       meta: { requiresAuth: true } },
  { path: '/reports',      component: ReportsView,      meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ── Navigation guard ───────────────────────────────────────────
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
