<template>
  <Teleport to="body">
    <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pie-chart me-2"></i>
              {{ editing ? 'Edit Budget' : 'Set Budget' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12" style="display: none;">
                  <!-- Category removed as budget is global now -->
                </div>
                <div class="col-sm-6">
                  <label class="form-label">Month *</label>
                  <input v-model="form.month" type="month" class="form-control" required :disabled="editing" />
                </div>
                <div class="col-sm-6">
                  <label class="form-label">Budget Limit (₹) *</label>
                  <input v-model.number="form.limit" type="number" class="form-control"
                         placeholder="5000" min="1" required />
                </div>
              </div>
              <div v-if="error" class="alert alert-danger mt-3 py-2 text-sm">{{ error }}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ editing ? 'Update' : 'Set Budget' }}
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
import { useBudgetStore }   from '@/store/budgetStore'
import { useUiStore }       from '@/store/uiStore'
import { getLocalISOMonth } from '@/utils/dateUtils'

const props = defineProps({
  modalId:  { type: String, default: 'budgetModal' },
  editData: { type: Object, default: null },
})
const emit = defineEmits(['saved'])

const budgetStore   = useBudgetStore()
const uiStore       = useUiStore()

const editing = computed(() => !!props.editData)
const loading = ref(false)
const error   = ref('')

const defaultForm = () => ({
  month: getLocalISOMonth(),
  limit: '',
})
const form = ref(defaultForm())

watch(() => props.editData, (val) => {
  if (val) {
    form.value = { month: val.month, limit: val.limit }
  } else {
    form.value = defaultForm()
  }
}, { immediate: true })

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    if (editing.value) {
      await budgetStore.update(props.editData._id, { limit: form.value.limit })
      uiStore.addToast('Budget updated!', 'success')
    } else {
      await budgetStore.create(form.value)
      uiStore.addToast('Budget set!', 'success')
    }
    emit('saved')
    document.getElementById(props.modalId)
      && window.bootstrap?.Modal.getInstance(document.getElementById(props.modalId))?.hide()
    form.value = defaultForm()
  } catch (err) {
    error.value = err.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>
