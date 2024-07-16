<script setup>
import { ref } from 'vue'
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'

const auth = getAuth();
const user = auth.currentUser;

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const passwordVisible = ref({
  current: false,
  new: false,
  confirm: false,
})

const error = ref('')
const success = ref('')

const togglePasswordVisibility = (field) => {
  passwordVisible.value[field] = !passwordVisible.value[field]
}

const changePassword = async () => {
  error.value = ''
  success.value = ''

  if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
    error.value = 'Las contraseñas nuevas no coinciden.'
    return
  }

  try {
    const credential = EmailAuthProvider.credential(
      user.email,
      passwordForm.value.currentPassword
    )

    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, passwordForm.value.newPassword)

    success.value = 'Contraseña actualizada con éxito.'
    passwordForm.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
  } catch (err) {
    console.error(err)
    error.value = 'Error al cambiar la contraseña. Asegúrate de que la contraseña actual sea correcta.'
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <div class="flex justify-center items-center min-h-screen">
        <CardBox is-form @submit.prevent="changePassword" class="w-full max-w-lg mx-auto">
          <h2 class="text-2xl font-bold mb-6 text-center">Cambiar Contraseña</h2>

          <FormField label="Contraseña Actual" help="Ingresa tu contraseña actual">
            <FormControl
              v-model="passwordForm.currentPassword"
              :icon="passwordVisible.current ? mdiEyeOutline : mdiEyeOffOutline"
              :type="passwordVisible.current ? 'text' : 'password'"
              name="currentPassword"
              required
              @icon-click="togglePasswordVisibility('current')"
            />
          </FormField>

          <FormField label="Nueva Contraseña" help="Ingresa tu nueva contraseña">
            <FormControl
              v-model="passwordForm.newPassword"
              :icon="passwordVisible.new ? mdiEyeOutline : mdiEyeOffOutline"
              :type="passwordVisible.new ? 'text' : 'password'"
              name="newPassword"
              required
              @icon-click="togglePasswordVisibility('new')"
            />
          </FormField>

          <FormField label="Confirmar Nueva Contraseña" help="Repite tu nueva contraseña">
            <FormControl
              v-model="passwordForm.confirmNewPassword"
              :icon="passwordVisible.confirm ? mdiEyeOutline : mdiEyeOffOutline"
              :type="passwordVisible.confirm ? 'text' : 'password'"
              name="confirmNewPassword"
              required
              @icon-click="togglePasswordVisibility('confirm')"
            />
          </FormField>

          <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
          <div v-if="success" class="text-green-500 mt-4">{{ success }}</div>

          <template #footer>
            <BaseButtons>
              <BaseButton type="submit" color="info" label="Cambiar Contraseña" />
              <BaseButton color="info" label="Cancelar" outline />
            </BaseButtons>
          </template>
        </CardBox>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>