<!-- LanguagesView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import DataTableView from '@/components/DataTableView.vue'
import { mdiTranslate } from '@mdi/js'
import { fetchLanguages, updateLanguage } from '@/api/woocommerce'

const title = 'Languages'
const columns = ['id', 'name', 'actions'] // Añadir columna de acciones
const columnLabels = { id: 'ID', name: 'Nombre', actions: 'Acciones' } // Etiqueta para la columna de acciones
const icon = mdiTranslate
const checkable = false

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
    const { data } = await fetchLanguages()
    return transformData(data)
  } catch (error) {
    console.error('Error fetching languages:', error)
    throw error
  }
}

const handleUpdateLanguage = async (id, updatedData) => {
  try {
    const response = await updateLanguage(id, updatedData)
    return response
  } catch (error) {
    console.error('Error updating language:', error)
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
    :newRoute="'languageForm'"
    :updateLanguage="handleUpdateLanguage"
  />
</template>
