<script setup>
import DataTableView from '@/components/DataTableView.vue'
import { mdiAccount } from '@mdi/js'

const endpoint = 'https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/1/terms'
const title = 'Authors'
const columns = ['id', 'name']
const columnLabels = { id: 'ID', name: 'Nombre' }
const icon = mdiAccount
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
    new-route="authorForm"
  />
</template>
