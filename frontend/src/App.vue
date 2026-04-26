<template>
  <!-- Root App wrapper -->
  <div data-theme="light">
    <!-- Auth layout (no sidebar) -->
    <router-view v-if="!authStore.isAuthenticated" />

    <!-- App layout with sidebar -->
    <template v-else>
      <div class="sidebar-overlay" :class="{ open: uiStore.sidebarOpen }" @click="uiStore.closeSidebar()" />
      <div class="app-layout">
        <AppSidebar />
        <div class="app-main">
          <AppNavbar />
          <main class="page-content">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </main>
        </div>
      </div>
    </template>

    <!-- Global toasts -->
    <ToastNotification />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useUiStore   } from '@/store/uiStore'
import AppSidebar       from '@/components/AppSidebar.vue'
import AppNavbar        from '@/components/AppNavbar.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const authStore = useAuthStore()
const uiStore   = useUiStore()

onMounted(() => {
  authStore.fetchMe()
})
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
