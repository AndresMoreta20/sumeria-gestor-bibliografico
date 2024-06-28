<script setup>
import DataTableView from '@/components/DataTableView.vue'
import { mdiAccount } from '@mdi/js'

const endpoint = 'https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/1/terms'
const title = 'Authors'
const columns = ['id', 'name', 'slug', 'description']
const icon = mdiAccount
const checkable = false
</script>

<template>
  <DataTableView :endpoint="endpoint" :title="title" :columns="columns" :icon="icon" :checkable="checkable" />
</template>
