<template>
  <Teleport to="body">
    <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-tag me-2"></i>
              {{ editing ? 'Edit Category' : 'New Category' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Name *</label>
                  <input v-model="form.name" type="text" class="form-control"
                         placeholder="e.g. Gym Membership" maxlength="30" required />
                </div>
                <div class="col-sm-6">
                  <label class="form-label">Type *</label>
                  <select v-model="form.type" class="form-select">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div class="col-sm-6">
                  <label class="form-label">Color</label>
                  <input v-model="form.color" type="color" class="form-control form-control-color w-100" />
                </div>
                <div class="col-12">
                  <label class="form-label">Icon (Bootstrap Icons class)</label>
                  <div class="input-group">
                    <span class="input-group-text"><i :class="['bi', form.icon]"></i></span>
                    <input v-model="form.icon" type="text" class="form-control" placeholder="bi-tag" />
                  </div>
                  <div class="form-text">
                    Find icons at <a href="https://icons.getbootstrap.com" target="_blank">icons.getbootstrap.com</a>
                  </div>
                </div>
              </div>
              <div v-if="error" class="alert alert-danger mt-3 py-2 text-sm">{{ error }}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ editing ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCategoryStore } from '@/store/categoryStore'
import { useUiStore }       from '@/store/uiStore'

const props = defineProps({
  modalId:  { type: String, default: 'categoryModal' },
  editData: { type: Object, default: null },
})
const emit = defineEmits(['saved'])

const categoryStore = useCategoryStore()
const uiStore       = useUiStore()
const editing       = computed(() => !!props.editData)
const loading       = ref(false)
const error         = ref('')

const defaultForm = () => ({ name: '', type: 'expense', color: '#6366f1', icon: 'bi-tag' })
const form = ref(defaultForm())

watch(() => props.editData, (val) => {
  form.value = val
    ? { name: val.name, type: val.type, color: val.color, icon: val.icon }
    : defaultForm()
}, { immediate: true })

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    if (editing.value) {
      await categoryStore.update(props.editData._id, form.value)
      uiStore.addToast('Category updated!', 'success')
    } else {
      await categoryStore.create(form.value)
      uiStore.addToast('Category created!', 'success')
    }
    emit('saved')
    window.bootstrap?.Modal.getInstance(document.getElementById(props.modalId))?.hide()
    form.value = defaultForm()
  } catch (err) {
    error.value = err.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>
