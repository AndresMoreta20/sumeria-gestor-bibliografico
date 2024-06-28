<script setup>
import DataTableView from '@/components/DataTableView.vue'
import { mdiTranslate } from '@mdi/js'

const endpoint = 'https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/7/terms'
const title = 'Languages'
const columns = ['id', 'name', 'slug', 'description']
const checkable = false
const icon = mdiTranslate
</script>

<template>
  <DataTableView :endpoint="endpoint" :title="title" :columns="columns" :checkable="checkable" :icon="icon" />
</template>
