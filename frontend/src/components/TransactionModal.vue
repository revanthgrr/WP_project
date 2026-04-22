<template>
  <Teleport to="body">
    <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true" ref="modalEl">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="['bi me-2', editing ? 'bi-pencil-square' : 'bi-plus-circle']"></i>
              {{ editing ? 'Edit Transaction' : 'Add Transaction' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <!-- Type toggle -->
              <div class="type-toggle mb-4">
                <button
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.type === 'expense' }"
                  @click="form.type = 'expense'"
                >
                  <i class="bi bi-arrow-up-circle-fill me-1"></i> Expense
                </button>
                <button
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.type === 'income', income: true }"
                  @click="form.type = 'income'"
                >
                  <i class="bi bi-arrow-down-circle-fill me-1"></i> Income
                </button>
              </div>

              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Amount *</label>
                  <div class="input-group">
                    <span class="input-group-text">₹</span>
                    <input v-model.number="form.amount" type="number" class="form-control"
                           placeholder="0.00" min="0.01" step="0.01" required />
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label">Category *</label>
                  <select v-model="form.categoryId" class="form-select" required>
                    <option value="" disabled>Select a category</option>
                    <option v-for="cat in filteredCategories" :key="cat._id" :value="cat._id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div class="col-sm-6">
                  <label class="form-label">Date *</label>
                  <input v-model="form.date" type="date" class="form-control" required />
                </div>

                <div class="col-12">
                  <label class="form-label">Notes</label>
                  <textarea v-model="form.notes" class="form-control" rows="2"
                            placeholder="Optional notes…" maxlength="200"></textarea>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger mt-3 py-2 text-sm">
                <i class="bi bi-exclamation-triangle me-1"></i>{{ error }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ editing ? 'Update' : 'Add Transaction' }}
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
import { useCategoryStore }     from '@/store/categoryStore'
import { useTransactionStore }  from '@/store/transactionStore'
import { useUiStore }           from '@/store/uiStore'
import { getLocalISODate }      from '@/utils/dateUtils'

const props = defineProps({
  modalId:  { type: String, default: 'transactionModal' },
  editData: { type: Object, default: null },
})
const emit = defineEmits(['saved'])

const categoryStore    = useCategoryStore()
const transactionStore = useTransactionStore()
const uiStore          = useUiStore()

const editing = computed(() => !!props.editData)
const loading = ref(false)
const error   = ref('')

const defaultForm = () => ({
  type:       'expense',
  amount:     '',
  categoryId: '',
  date:       getLocalISODate(),
  notes:      '',
})

const form = ref(defaultForm())

watch(() => props.editData, (val) => {
  if (val) {
    form.value = {
      type:       val.type,
      amount:     val.amount,
      categoryId: val.categoryId?._id || val.categoryId,
      date:       getLocalISODate(new Date(val.date)),
      notes:      val.notes || '',
    }
  } else {
    form.value = defaultForm()
  }
}, { immediate: true })

const filteredCategories = computed(() =>
  form.value.type === 'income'
    ? categoryStore.incomeCategories
    : categoryStore.expenseCategories
)

const handleSubmit = async () => {
  error.value   = ''
  loading.value = true
  try {
    if (editing.value) {
      await transactionStore.update(props.editData._id, form.value)
      uiStore.addToast('Transaction updated!', 'success')
    } else {
      await transactionStore.create(form.value)
      uiStore.addToast('Transaction added!', 'success')
    }
    emit('saved')
    // Close modal
    const modalEl = document.getElementById(props.modalId)
    const bsModal = window.bootstrap?.Modal.getInstance(modalEl)
    bsModal?.hide()
    form.value = defaultForm()
  } catch (err) {
    error.value = err.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.type-toggle {
  display: flex;
  background: var(--bg-hover);
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}
.toggle-btn {
  flex: 1;
  padding: .5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: .875rem;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all .2s;
}
.toggle-btn.active {
  background: var(--color-danger);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239,68,68,.3);
}
.toggle-btn.active.income {
  background: var(--color-success);
  box-shadow: 0 2px 8px rgba(34,197,94,.3);
}
</style>
