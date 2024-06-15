<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { mdiFolderPlus } from '@mdi/js'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'

const form = ref({
  name: '',
  description: ''
})

const saveCategory = async () => {
  try {
    const response = await axios.post('https://cindyl23.sg-host.com/wp-json/wc/v3/products/categories', {
      name: form.value.name,
      description: form.value.description
    }, {
      auth: {
        username: import.meta.env.VITE_APP_CONSUMER_KEY,
        password: import.meta.env.VITE_APP_CONSUMER_SECRET
      }
    })
    console.log('Category created:', response.data)
  } catch (error) {
    console.error('Error creating category:', error)
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiFolderPlus" title="Add New Category" main>
      </SectionTitleLineWithButton>
      
      <CardBox form @submit.prevent="saveCategory">
        <FormField label="Category Name">
          <FormControl v-model="form.name" placeholder="Enter category name" />
        </FormField>

        <FormField label="Description">
          <FormControl v-model="form.description" type="textarea" placeholder="Enter description" />
        </FormField>

        <template #footer>
          <BaseButtons>
            <BaseButton type="submit" color="info" label="Save" />
            <BaseButton type="reset" color="info" outline label="Reset" @click="form.name = ''; form.description = ''" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
