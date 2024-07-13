<script setup>
import { ref } from 'vue'
import { mdiAccountPlus } from '@mdi/js'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import { createAuthor } from '@/api/woocommerce'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ name: '' })
const errorMessage = ref('')

const saveAuthor = async () => {
  try {
    await createAuthor(form.value.name)
    router.push({ name: 'authors' })
  } catch (error) {
    errorMessage.value = 'Error al crear el autor: ' + (error.response?.data?.message || error.message)
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiAccountPlus" title="Nuevo Autor" main />
      
      <CardBox form>
        <FormField label="Nombre">
          <FormControl v-model="form.name" placeholder="Ingrese el nombre del autor" required />
        </FormField>

        <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>

        <template #footer>
          <BaseButtons>
            <BaseButton type="button" color="info" label="Guardar" @click="saveAuthor" />
            <BaseButton type="reset" color="info" outline label="Reiniciar" @click="form.name = ''" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>