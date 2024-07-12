<!-- CategoriesView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import DataTableView from '@/components/DataTableView.vue'
import { mdiHeart } from '@mdi/js'
import { fetchCategories } from '@/api/woocommerce'

const title = 'Categorías'
const columns = ['id', 'name']
const columnLabels = { id: 'ID', name: 'Nombre' }
const icon = mdiHeart
const checkable = false

const categories = ref([])

const transformData = (data) => {
  return data.map(item => {
    return {
      id: item.id,
      name: item.name
    }
  })
}

const dataFetchFunction = async () => {
  try {
    const { data } = await fetchCategories()
    return transformData(data)
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

</script>

<template>
  <DataTableView
    :title="title"
    :columns="columns"
    :column-labels="columnLabels"
    :icon="icon"
    :checkable="checkable"
    :dataFetchFunction="dataFetchFunction"
  />
</template>
