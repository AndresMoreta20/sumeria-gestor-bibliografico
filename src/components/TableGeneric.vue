<!-- TableGeneric.vue -->
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router' // Importar el router
import { mdiEye, mdiMagnify, mdiPlus } from '@mdi/js'
import CardBoxModal from '@/components/CardBoxModal.vue'
import TableCheckboxCell from '@/components/TableCheckboxCell.vue'
import BaseLevel from '@/components/BaseLevel.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import FormControl from '@/components/FormControl.vue'

const router = useRouter() // Usar el router

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
    required: true // Añadir la prop para la ruta de creación
  }
})

const isModalActive = ref(false)
const selectedItem = ref(null)
const searchQuery = ref('')
const perPage = ref(5)
const currentPage = ref(0)
const checkedRows = ref([])

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

const remove = (arr, cb) => {
  const newArr = []
  arr.forEach((item) => {
    if (!cb(item)) {
      newArr.push(item)
    }
  })
  return newArr
}

const checked = (isChecked, item) => {
  if (isChecked) {
    checkedRows.value.push(item)
  } else {
    checkedRows.value = remove(checkedRows.value, (row) => row.id === item.id)
  }
}

const viewItem = (item) => {
  selectedItem.value = item
  isModalActive.value = true
}

const goToNew = () => {
  router.push({ name: props.newRoute }) // Redirigir a la ruta nueva
}
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="Detalles del elemento">
    <div v-if="selectedItem">
      <p>ID: {{ selectedItem.id }}</p>
      <p>Nombre: {{ selectedItem.name }}</p>
    </div>
  </CardBoxModal>

  <div class="flex justify-between items-center mb-4">
    <div class="relative w-full">
      <FormControl v-model="searchQuery" placeholder="Buscar" transparent borderless class="pl-10 w-full" />
      <svg class="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
        <path :d="mdiMagnify" />
      </svg>
    </div>
    <BaseButton color="primary" :icon="mdiPlus" @click="goToNew">Nuevo</BaseButton> <!-- Botón Nuevo -->
  </div>

  <table>
    <thead>
      <tr>
        <th v-if="checkable" />
        <th v-for="column in columns" :key="column">{{ columnLabels[column] || column }}</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in itemsPaginated" :key="item.id">
        <TableCheckboxCell v-if="checkable" @checked="checked($event, item)" />
        <td v-for="column in columns" :key="column">{{ item[column] }}</td>
        <td class="before:hidden lg:w-1 whitespace-nowrap">
          <BaseButtons type="justify-start lg:justify-end" no-wrap>
            <BaseButton color="info" :icon="mdiEye" small @click="viewItem(item)" />
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
      <small>Page {{ currentPageHuman }} of {{ numPages }}</small>
    </BaseLevel>
  </div>
</template>
