<script setup>
import DataTableView from '@/components/DataTableView.vue'
import { mdiTranslate } from '@mdi/js'

const endpoint = 'https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/7/terms'
const title = 'Languages'
const columns = ['id', 'name']
const columnLabels = { id: 'ID', name: 'Nombre' }
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
</script>

<template>
  <DataTableView
    :endpoint="endpoint"
    :title="title"
    :columns="columns"
    :column-labels="columnLabels"
    :icon="icon"
    :checkable="checkable"
    :data-transform="transformData"
    new-route="languageForm"
  />
</template>
