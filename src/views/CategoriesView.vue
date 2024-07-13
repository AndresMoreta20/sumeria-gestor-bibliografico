<!-- CategoriesView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import DataTableView from '@/components/DataTableView.vue'
import { mdiHeart } from '@mdi/js'
import { fetchCategories, updateCategory } from '@/api/woocommerce'

const title = 'Categorías'
const columns = ['id', 'name', 'actions']
const columnLabels = { id: 'ID', name: 'Nombre', actions: 'Acciones' }
const icon = mdiHeart
const checkable = false

const transformData = (data) => {
  return data.map(item => ({
    id: item.id,
    name: item.name
  }))
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

const handleUpdateCategory = async (id, updatedData) => {
  try {
    const response = await updateCategory(id, updatedData)
    return response
  } catch (error) {
    console.error('Error updating category:', error)
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
    :updateFunction="handleUpdateCategory"
    new-route="categoryForm"
  />
</template>