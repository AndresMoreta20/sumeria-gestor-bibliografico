<script setup>
import { ref } from 'vue'
import { mdiBookOpenPageVariant } from '@mdi/js'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import { createPublisher } from '@/api/woocommerce'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ name: '' })
const errorMessage = ref('')
const isLoading = ref(false)

const savePublisher = async () => {
  if (!form.value.name.trim()) {
    errorMessage.value = 'El nombre de la editorial no puede estar vacío'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await createPublisher(form.value.name)
    router.push({ name: 'publishers' })
  } catch (error) {
    console.error('Error creating publisher:', error)
    errorMessage.value = 'Error al crear la editorial: ' + (error.response?.data?.message || error.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBookOpenPageVariant" title="Nueva Editorial" main />
      
      <CardBox form>
        <FormField label="Nombre">
          <FormControl v-model="form.name" placeholder="Ingrese el nombre de la editorial" required :disabled="isLoading" />
        </FormField>

        <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>

        <template #footer>
          <BaseButtons>
            <BaseButton 
              type="button" 
              color="info" 
              :label="isLoading ? 'Guardando...' : 'Guardar'" 
              @click="savePublisher" 
              :disabled="isLoading"
              :loading="isLoading"
            />
            <BaseButton 
              type="reset" 
              color="info" 
              outline 
              label="Reiniciar" 
              @click="form.name = ''" 
              :disabled="isLoading"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>