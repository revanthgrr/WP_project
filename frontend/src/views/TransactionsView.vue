<template>
  <div class="fade-in">
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h2 class="h4 fw-bold mb-0">Transactions</h2>
        <p class="text-muted text-sm mb-0">{{ store.pagination.total }} total records</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <button class="btn btn-outline-secondary btn-sm" @click="handleExport">
          <i class="bi bi-download me-1"></i>Export CSV
        </button>
        <!-- Import button triggers hidden file input -->
        <button class="btn btn-outline-primary btn-sm" @click="$refs.importInput.click()" :disabled="importing">
          <span v-if="importing" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-upload me-1"></i>
          {{ importing ? 'Importing…' : 'Import CSV / PDF' }}
        </button>
        <input ref="importInput" type="file" accept=".csv,.pdf" class="d-none" @change="handleImport" />

        <button class="btn btn-outline-danger btn-sm" @click="handleDeleteAll" :disabled="store.transactions.length === 0">
          <i class="bi bi-trash3 me-1"></i>Delete All
        </button>

        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#txModal" @click="editTarget = null">
          <i class="bi bi-plus-lg me-1"></i>Add Transaction
        </button>
      </div>

    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-sm-6 col-md-3">
            <label class="form-label text-xs mb-1">Search</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input v-model="store.filters.search" type="text" class="form-control"
                     placeholder="Search notes…" @input="debouncedFetch" />
            </div>
          </div>
          <div class="col-sm-6 col-md-2">
            <label class="form-label text-xs mb-1">Type</label>
            <select v-model="store.filters.type" class="form-select form-select-sm" @change="store.fetch()">
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div class="col-sm-6 col-md-3">
            <label class="form-label text-xs mb-1">Category</label>
            <select v-model="store.filters.categoryId" class="form-select form-select-sm" @change="store.fetch()">
              <option value="">All Categories</option>
              <option v-for="cat in categoryStore.categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="col-sm-6 col-md-2">
            <label class="form-label text-xs mb-1">Month</label>
            <input v-model="store.filters.month" type="month" class="form-control form-control-sm"
                   @change="store.fetch()" />
          </div>
          <div class="col-auto">
            <button class="btn btn-outline-secondary btn-sm" @click="clearFilters">
              <i class="bi bi-x-circle me-1"></i>Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-body p-0">
        <div v-if="store.loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="store.transactions.length === 0" class="text-center py-5">
          <i class="bi bi-inbox display-4 text-muted d-block mb-2 opacity-25"></i>
          <p class="text-muted">No transactions found</p>
          <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#txModal" @click="editTarget = null">Add your first transaction</button>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Notes</th>
                <th>Type</th>
                <th class="text-end">Amount</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in store.transactions" :key="tx._id">
                <td style="white-space:nowrap">{{ formatDate(tx.date) }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="cat-dot" :style="{ background: tx.categoryId?.color }"></span>
                    {{ tx.categoryId?.name || '—' }}
                  </div>
                </td>
                <td class="text-muted text-sm" style="max-width:200px">
                  <span class="text-truncate d-block">{{ tx.notes || '—' }}</span>
                </td>
                <td>
                  <span :class="['badge', tx.type === 'income' ? 'bg-income-soft' : 'bg-expense-soft']">
                    {{ tx.type }}
                  </span>
                </td>
                <td :class="['text-end fw-semibold', tx.type === 'income' ? 'text-income' : 'text-expense']">
                  {{ tx.type === 'income' ? '+' : '-' }}₹{{ tx.amount.toLocaleString('en-IN') }}
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#txModal" @click="editTarget = tx">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" @click="deleteTarget = tx">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div class="modal fade" id="deleteModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content">
            <div class="modal-body text-center py-4">
              <i class="bi bi-trash display-5 text-danger mb-3 d-block"></i>
              <h5 class="fw-bold">Delete Transaction?</h5>
              <p class="text-muted text-sm">This cannot be undone.</p>
            </div>
            <div class="modal-footer justify-content-center">
              <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-danger btn-sm" @click="handleDelete">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Transaction modal -->
    <TransactionModal modal-id="txModal" :edit-data="editTarget" @saved="store.fetch()" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransactionStore } from '@/store/transactionStore'
import { useCategoryStore }    from '@/store/categoryStore'
import { useUiStore }          from '@/store/uiStore'
import TransactionModal        from '@/components/TransactionModal.vue'

const store         = useTransactionStore()
const categoryStore = useCategoryStore()
const uiStore       = useUiStore()

const editTarget   = ref(null)
const deleteTarget = ref(null)
const importing    = ref(false)
let searchTimer    = null

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const debouncedFetch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.fetch(), 400)
}

const clearFilters = () => {
  store.filters.search = ''
  store.filters.type = ''
  store.filters.categoryId = ''
  store.filters.month = ''
  store.fetch()
}



const handleDelete = async () => {
  try {
    await store.remove(deleteTarget.value._id)
    uiStore.addToast('Transaction deleted', 'success')
    window.bootstrap?.Modal.getInstance(document.getElementById('deleteModal'))?.hide()
  } catch {
    uiStore.addToast('Failed to delete', 'error')
  }
}

const handleDeleteAll = async () => {
  if (!confirm(`⚠️ This will permanently delete ALL ${store.pagination.total} transactions. This cannot be undone. Are you sure?`)) return
  try {
    await store.removeAll()
    uiStore.addToast('All transactions deleted', 'success')
  } catch {
    uiStore.addToast('Failed to delete all transactions', 'error')
  }
}

const handleExport = async () => {
  try {
    await store.exportCSV()
    uiStore.addToast('CSV exported!', 'success')
  } catch {
    uiStore.addToast('Export failed', 'error')
  }
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  importing.value = true
  try {
    const result = await store.importFile(file)
    const { imported, skipped } = result.data
    uiStore.addToast(`✅ Imported ${imported} transaction${imported !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped)` : ''}.`, 'success')
    await store.fetch()
  } catch (err) {
    uiStore.addToast(err.response?.data?.message || 'Import failed', 'error')
  } finally {
    importing.value = false
    event.target.value = '' // Reset file input so same file can be re-imported
  }
}

onMounted(async () => {
  await categoryStore.fetch()
  await store.fetch()
})
</script>

<style scoped>
.cat-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
</style>
