<template>
  <div class="fade-in">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h2 class="h4 fw-bold mb-0">Categories</h2>
        <p class="text-muted text-sm mb-0">Manage income and expense categories</p>
      </div>
      <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#categoryModal" @click="editTarget = null">
        <i class="bi bi-plus-lg me-1"></i>New Category
      </button>
    </div>

    <div v-if="categoryStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else class="row g-3">
      <div v-for="cat in categoryStore.categories" :key="cat._id" class="col-sm-6 col-md-4 col-lg-3">
        <div class="card cat-card">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="cat-icon" :style="{ background: `${cat.color}20`, color: cat.color }">
              <i :class="['bi', cat.icon || 'bi-tag']"></i>
            </div>
            <div class="flex-grow-1" style="min-width: 0;">
              <div class="fw-semibold text-truncate" :title="cat.name">{{ cat.name }}</div>
              <span :class="['badge text-xs', typeBadgeClass(cat.type)]">{{ cat.type }}</span>
            </div>
            <div v-if="!cat.isDefault" class="d-flex gap-1 flex-shrink-0">
              <button class="btn btn-xs btn-outline-primary" data-bs-toggle="modal" data-bs-target="#categoryModal" @click="editTarget = cat">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-xs btn-outline-danger" @click="handleDelete(cat)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <span v-else class="badge bg-secondary text-xs flex-shrink-0">default</span>
          </div>
        </div>
      </div>
    </div>

    <CategoryModal modal-id="categoryModal" :edit-data="editTarget" @saved="categoryStore.fetch()" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/store/categoryStore'
import { useUiStore }       from '@/store/uiStore'
import CategoryModal        from '@/components/CategoryModal.vue'

const categoryStore = useCategoryStore()
const uiStore       = useUiStore()
const editTarget    = ref(null)

const typeBadgeClass = (type) => ({
  'bg-expense-soft': type === 'expense',
  'bg-income-soft':  type === 'income',
  'bg-primary-soft': type === 'both',
})


const handleDelete = async (cat) => {
  if (!confirm(`Delete "${cat.name}"?`)) return
  try {
    await categoryStore.remove(cat._id)
    uiStore.addToast('Category deleted', 'success')
  } catch (err) {
    uiStore.addToast(err.response?.data?.message || 'Failed to delete', 'error')
  }
}

onMounted(() => categoryStore.fetch())
</script>

<style scoped>
.cat-icon { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0; }
.cat-card { transition:transform .18s ease,box-shadow .18s ease; }
.cat-card:hover { transform:translateY(-2px); }
.btn-xs { padding:.15rem .4rem;font-size:.7rem; }
</style>
