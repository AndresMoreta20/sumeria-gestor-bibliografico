<!-- TableGeneric.vue -->
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mdiEye, mdiMagnify, mdiPlus, mdiPencil } from '@mdi/js'
import CardBoxModal from '@/components/CardBoxModal.vue'
import TableCheckboxCell from '@/components/TableCheckboxCell.vue'
import BaseLevel from '@/components/BaseLevel.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import FormControl from '@/components/FormControl.vue'

const isAlertModalActive = ref(false)
const isSuccessModalActive = ref(false)
const isLoadingModalActive = ref(false)
const router = useRouter()

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  checkable: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array,
    required: true
  },
  columnLabels: {
    type: Object,
    required: false,
    default: () => ({})
  },
  newRoute: {
    type: String,
    required: true
  },
  hideEditButton: {
    type: Boolean,
    default: false
  },
  updateFunction: {
    type: Function,
    required: false
  }
})

const emit = defineEmits(['itemUpdated'])

const isModalActive = ref(false)
const isEditModalActive = ref(false)
const selectedItem = ref(null)
const editedValue = ref('')
const searchQuery = ref('')
const perPage = ref(8)
const currentPage = ref(0)
const checkedRows = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const filteredItems = computed(() => {
  return props.items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const itemsPaginated = computed(() =>
  filteredItems.value.slice(perPage.value * currentPage.value, perPage.value * (currentPage.value + 1))
)

const numPages = computed(() => Math.ceil(filteredItems.value.length / perPage.value))
const currentPageHuman = computed(() => currentPage.value + 1)

const pagesList = computed(() => {
  const pagesList = []
  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i)
  }
  return pagesList
})

const checked = (isChecked, item) => {
  if (isChecked) {
    checkedRows.value.push(item)
  } else {
    checkedRows.value = checkedRows.value.filter((row) => row.id !== item.id)
  }
}

const viewItem = (item) => {
  selectedItem.value = item
  isModalActive.value = true
}

const editItem = (item) => {
  selectedItem.value = item
  editedValue.value = item.name
  isAlertModalActive.value = true
  errorMessage.value = ''
}

const confirmEdit = () => {
  isAlertModalActive.value = false
  isEditModalActive.value = true
}
const saveEdit = async () => {
  if (!selectedItem.value || !props.updateFunction) return

  isEditModalActive.value = false
  isLoadingModalActive.value = true
  errorMessage.value = ''

  try {
    const updatedItem = await props.updateFunction(selectedItem.value.id, { name: editedValue.value })
    Object.assign(selectedItem.value, updatedItem)
    isLoadingModalActive.value = false
    isSuccessModalActive.value = true
    emit('itemUpdated', updatedItem)
  } catch (error) {
    console.error('Error updating item:', error)
    errorMessage.value = `Error al actualizar: ${error.response?.data?.message || error.message}`
    isLoadingModalActive.value = false
    isEditModalActive.value = true
  }
}

const goToNew = () => {
  router.push({ name: props.newRoute })
}

const closeViewModal = () => {
  isModalActive.value = false
}

const closeEditModal = () => {
  if (!isLoading.value) {
    isEditModalActive.value = false
  }
}
const closeSuccessModal = () => {
  isSuccessModalActive.value = false
}


</script>

<template>
  <CardBoxModal
    v-model="isModalActive"
    title="Detalles del elemento"
    button="info"
    has-cancel
    @confirm="closeViewModal"
    @cancel="closeViewModal"
  >
    <div v-if="selectedItem">
      <p v-for="column in columns" :key="column">
        {{ columnLabels[column] || column }}: {{ selectedItem[column] }}
      </p>
    </div>
  </CardBoxModal>

  <CardBoxModal
  v-model="isAlertModalActive"
  title="Advertencia"
  button="danger"
  has-cancel
  @confirm="confirmEdit"
  @cancel="isAlertModalActive = false"
>
  <p>¿Estás seguro que deseas editar este elemento?</p>
  <p class="mt-2 font-bold">Advertencia: Editar modificará todos los libros relacionados a este campo.</p>
</CardBoxModal>


<CardBoxModal
  v-model="isEditModalActive"
  title="Editar elemento"
  :button="isLoading ? null : 'warning'"
  :has-cancel="!isLoading"
  @confirm="saveEdit"
  @cancel="closeEditModal"
  :cancelable="!isLoading"
>
  <div v-if="selectedItem">
    <FormControl
      v-model="editedValue"
      label="Nombre"
      placeholder="Editar nombre"
      :disabled="isLoading"
    />
    <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
    <div v-if="isLoading" class="text-center mt-4">
      <span class="loading loading-spinner loading-md"></span>
      <p>Actualizando...</p>
    </div>
  </div>
  <template #footer>
    <BaseButtons v-if="!isLoading">
      <BaseButton label="Cancelar" color="info" @click="closeEditModal" />
      <BaseButton label="Guardar" color="warning" @click="saveEdit" />
    </BaseButtons>
    <div v-else class="text-center">
      <span class="loading loading-spinner loading-md"></span>
      <p>Actualizando...</p>
    </div>
  </template>
</CardBoxModal>


<CardBoxModal
  v-model="isLoadingModalActive"
  title="Actualizando"
  :cancelable="false"
>
  <div class="text-center">
    <span class="loading loading-spinner loading-lg"></span>
    <p class="mt-4">Actualizando...</p>
  </div>
</CardBoxModal>

<CardBoxModal
  v-model="isSuccessModalActive"
  title="Actualización exitosa"
  button="success"
  @confirm="closeSuccessModal"
>
  <p>El elemento se ha actualizado con éxito.</p>
</CardBoxModal>

  <div class="flex justify-between items-center mb-4">
    <div class="relative w-full">
      <FormControl v-model="searchQuery" placeholder="Buscar" transparent borderless class="pl-10 w-full" />
      <svg class="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
        <path :d="mdiMagnify" />
      </svg>
    </div>
    <BaseButton color="primary" :icon="mdiPlus" @click="goToNew">Nuevo</BaseButton>
  </div>

  <table>
    <thead>
      <tr>
        <th v-if="checkable" />
        <th v-for="column in columns" :key="column">{{ columnLabels[column] || column }}</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in itemsPaginated" :key="item.id">
        <TableCheckboxCell v-if="checkable" @checked="checked($event, item)" />
        <td v-for="column in columns" :key="column">{{ item[column] }}</td>
        <td class="before:hidden lg:w-1 whitespace-nowrap">
          <BaseButtons type="justify-start lg:justify-end" no-wrap>
            <BaseButton color="info" :icon="mdiEye" small @click="viewItem(item)" />
            <BaseButton 
              v-if="!hideEditButton" 
              color="warning" 
              :icon="mdiPencil" 
              small 
              @click="editItem(item)"
            />
          </BaseButtons>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
    <BaseLevel>
      <BaseButtons>
        <BaseButton
          v-for="page in pagesList"
          :key="page"
          :active="page === currentPage"
          :label="page + 1"
          :color="page === currentPage ? 'lightDark' : 'whiteDark'"
          small
          @click="currentPage = page"
        />
      </BaseButtons>
      <small>Página {{ currentPageHuman }} de {{ numPages }}</small>
    </BaseLevel>
  </div>
</template>