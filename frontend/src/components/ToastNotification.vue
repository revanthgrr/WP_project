<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="toast show align-items-center mb-2"
        :class="toastClass(toast.type)"
        style="min-width: 300px;"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i :class="['bi', toastIcon(toast.type), 'fs-5']"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto"
                  @click="uiStore.removeToast(toast.id)" />
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useUiStore } from '@/store/uiStore'
const uiStore = useUiStore()

const toastClass = (type) => ({
  'bg-success text-white': type === 'success',
  'bg-danger  text-white': type === 'error',
  'bg-warning text-dark':  type === 'warning',
  'bg-info    text-white': type === 'info',
})
const toastIcon = (type) => ({
  success: 'bi-check-circle-fill',
  error:   'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info:    'bi-info-circle-fill',
}[type] || 'bi-bell-fill')
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to   { opacity: 0; transform: translateX(40px); }
</style>
