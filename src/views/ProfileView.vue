<script setup>
import { reactive } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiAsterisk, mdiFormTextboxPassword } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseDivider from '@/components/BaseDivider.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'

const mainStore = useMainStore()

const passwordForm = reactive({
  password_current: '',
  password: '',
  password_confirmation: ''
})

const submitPass = async () => {
  if (passwordForm.password !== passwordForm.password_confirmation) {
    alert('New passwords do not match.')
    return
  }

  const userEmail = sessionStorage.getItem('user-email'); // Obtener el correo electrónico del usuario
  if (!userEmail) {
    alert('User email is not available');
    return;
  }

  try {
    const token = sessionStorage.getItem('user-token'); // Obtener el JWT desde el almacenamiento de sesión

    const response = await fetch('https://cindyl23.sg-host.com/?rest_route=/simple-jwt-login/v1/user/reset_password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: userEmail, // Usar el correo electrónico del usuario desde sessionStorage
        new_password: passwordForm.password
      })
    });

    const data = await response.json();
    console.log('Server response:', data); // Log the server response
    if (response.ok) {
      alert('Your password has been reset successfully.');
    } else {
      throw new Error(data.message || 'Error resetting password');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    alert(`There was an error resetting the password: ${error.message}`);
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <div class="flex justify-center items-center min-h-screen">
        <CardBox is-form @submit.prevent="submitPass" class="w-full max-w-lg mx-auto">
          <FormField label="Current password" help="Required. Your current password">
            <FormControl
              v-model="passwordForm.password_current"
              :icon="mdiAsterisk"
              name="password_current"
              type="password"
              required
              autocomplete="current-password"
            />
          </FormField>

          <BaseDivider />

          <FormField label="New password" help="Required. New password">
            <FormControl
              v-model="passwordForm.password"
              :icon="mdiFormTextboxPassword"
              name="password"
              type="password"
              required
              autocomplete="new-password"
            />
          </FormField>

          <FormField label="Confirm password" help="Required. New password one more time">
            <FormControl
              v-model="passwordForm.password_confirmation"
              :icon="mdiFormTextboxPassword"
              name="password_confirmation"
              type="password"
              required
              autocomplete="new-password"
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton type="submit" color="info" label="Submit" />
              <BaseButton color="info" label="Options" outline />
            </BaseButtons>
          </template>
        </CardBox>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
