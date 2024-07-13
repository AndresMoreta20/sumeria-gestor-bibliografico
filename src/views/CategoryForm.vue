<script setup>
import { ref } from 'vue'
import { mdiHeart } from '@mdi/js'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import { createCategory } from '@/api/woocommerce'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ name: '' })
const errorMessage = ref('')

const saveCategory = async () => {
  console.log('saveCategory function called')
  console.log('Category name:', form.value.name)
  
  if (!form.value.name.trim()) {
    console.log('Category name is empty')
    errorMessage.value = 'El nombre de la categoría no puede estar vacío'
    return
  }

  try {
    console.log('Attempting to create category...')
    const result = await createCategory(form.value.name)
    console.log('Category created successfully:', result)
    router.push({ name: 'categories' })
  } catch (error) {
    console.error('Error creating category:', error)
    errorMessage.value = 'Error al crear la categoría: ' + (error.response?.data?.message || error.message)
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiHeart" title="Nueva Categoría" main />
      
      <CardBox form @submit.prevent="saveCategory">
        <FormField label="Nombre">
          <FormControl v-model="form.name" placeholder="Ingrese el nombre de la categoría" required />
        </FormField>

        <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>

        <template #footer>
          <BaseButtons>
            <BaseButton type="button" color="info" label="Guardar" @click="saveCategory" />
            <BaseButton type="reset" color="info" outline label="Reiniciar" @click="form.name = ''; console.log('Form reset')" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>