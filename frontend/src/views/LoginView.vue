<template>
  <div class="auth-page">
    <div class="auth-card fade-in">
      <!-- Header -->
      <div class="text-center mb-4">
        <div style="font-size:2.5rem;line-height:1">💰</div>
        <h1 class="h3 mt-2 mb-1 fw-bold">Welcome back</h1>
        <p class="text-muted text-sm">Sign in to your ExpenseIQ account</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label" for="login-email">Email</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input id="login-email" v-model="form.email" type="email" class="form-control"
                   placeholder="you@example.com" required autocomplete="email" />
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label" for="login-password">Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input id="login-password" v-model="form.password" :type="showPwd ? 'text' : 'password'"
                   class="form-control" placeholder="••••••••" required autocomplete="current-password" />
            <button type="button" class="input-group-text btn" @click="showPwd = !showPwd">
              <i :class="['bi', showPwd ? 'bi-eye-slash' : 'bi-eye']"></i>
            </button>
          </div>
        </div>

        <div v-if="error" class="alert alert-danger py-2 text-sm mb-3">
          <i class="bi bi-exclamation-triangle me-1"></i>{{ error }}
        </div>

        <button type="submit" class="btn btn-primary w-100 py-2" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Sign In
        </button>
      </form>

      <!-- Demo credentials -->
      <div class="demo-box mt-3 p-3 rounded-xl text-sm">
        <strong>Demo Account:</strong><br />
        Email: <code>demo@expensetracker.com</code><br />
        Password: <code>demo123456</code>
      </div>

      <p class="text-center text-muted text-sm mt-4 mb-0">
        Don't have an account?
        <router-link to="/register" class="fw-semibold">Create one</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter }    from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useUiStore }   from '@/store/uiStore'

const authStore = useAuthStore()
const uiStore   = useUiStore()
const router    = useRouter()

const form    = ref({ email: '', password: '' })
const loading = ref(false)
const error   = ref('')
const showPwd = ref(false)

const handleLogin = async () => {
  error.value   = ''
  loading.value = true
  try {
    await authStore.login(form.value)
    uiStore.addToast(`Welcome back! 🎉`, 'success')
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.demo-box {
  background: var(--bg-badge);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
</style>
