<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { mdiBookOpenPageVariant } from '@mdi/js'
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

const savePublisher = async () => {
  try {
    const response = await axios.post('https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/4/terms', {
      name: form.value.name,
      description: form.value.description
    }, {
      auth: {
        username: import.meta.env.VITE_APP_CONSUMER_KEY,
        password: import.meta.env.VITE_APP_CONSUMER_SECRET
      }
    })
    console.log('Publisher created:', response.data)
  } catch (error) {
    console.error('Error creating publisher:', error)
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBookOpenPageVariant" title="Add New Publisher" main>
      </SectionTitleLineWithButton>
      
      <CardBox form @submit.prevent="savePublisher">
        <FormField label="Publisher Name">
          <FormControl v-model="form.name" placeholder="Enter publisher name" />
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
