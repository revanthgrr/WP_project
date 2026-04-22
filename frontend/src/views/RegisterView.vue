<template>
  <div class="auth-page">
    <div class="auth-card fade-in">
      <div class="text-center mb-4">
        <div style="font-size:2.5rem;line-height:1">💰</div>
        <h1 class="h3 mt-2 mb-1 fw-bold">Create account</h1>
        <p class="text-muted text-sm">Start tracking your finances today</p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="mb-3">
          <label class="form-label" for="reg-name">Full Name</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-person"></i></span>
            <input id="reg-name" v-model="form.name" type="text" class="form-control"
                   placeholder="John Doe" required />
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="reg-email">Email</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input id="reg-email" v-model="form.email" type="email" class="form-control"
                   placeholder="you@example.com" required />
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label" for="reg-password">Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input id="reg-password" v-model="form.password" :type="showPwd ? 'text' : 'password'"
                   class="form-control" placeholder="At least 6 characters" required minlength="6" />
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
          Create Account
        </button>
      </form>

      <p class="text-center text-muted text-sm mt-4 mb-0">
        Already have an account?
        <router-link to="/login" class="fw-semibold">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref }          from 'vue'
import { useRouter }    from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useUiStore }   from '@/store/uiStore'

const authStore = useAuthStore()
const uiStore   = useUiStore()
const router    = useRouter()

const form    = ref({ name: '', email: '', password: '' })
const loading = ref(false)
const error   = ref('')
const showPwd = ref(false)

const handleRegister = async () => {
  error.value   = ''
  loading.value = true
  try {
    await authStore.register(form.value)
    uiStore.addToast('Account created! Welcome 🎉', 'success')
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>
