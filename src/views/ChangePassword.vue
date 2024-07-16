<template>
  <SectionMain>
    <SectionTitleLineWithButton :icon="mdiLock" title="Cambiar Contraseña" main />
    <div class="flex justify-center w-full">
      <CardBox class="mb-1 w-full sm:w-2/5 sm:max-w-sm lg:w-2/5">
        <form @submit.prevent="changePassword" class="">
          <FormField label="Contraseña Actual *" >
            <FormControl
              v-model="currentPassword"
              type="password"
              placeholder="Ingrese su contraseña actual"
              :icon="mdiLock"
              required
            />
            <p v-if="errors.currentPassword" class="mt-1 text-red-500 text-sm">
              {{ errors.currentPassword }}
            </p>
          </FormField>
          <FormField label="Nueva Contraseña *">
            <FormControl
              v-model="newPassword"
              type="password"
              placeholder="Ingrese su nueva contraseña"
              :icon="mdiLock"
              required
            />
            <p v-if="errors.newPassword" class="mt-1 text-red-500 text-sm">
              {{ errors.newPassword }}
            </p>
          </FormField>
          <FormField label="Confirmar Nueva Contraseña *" >
            <FormControl
              v-model="confirmPassword"
              type="password"
              placeholder="Confirme su nueva contraseña"
              :icon="mdiLock"
              required
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-red-500 text-sm">
              {{ errors.confirmPassword }}
            </p>
          </FormField>
        </form>

        <template #footer>
          <BaseButtons>
            <BaseButton
              type="button"
              color="info"
              :icon="mdiCheck"
              label="Cambiar Contraseña"
              :disabled="isSubmitting"
              @click="changePassword"
            />
          </BaseButtons>
          <label class="font-light">Los campos que tienen asterisco son obligatorios* </label>
        </template>
      </CardBox>
    </div>

    <NotificationBar v-if="notification.visible" :color="notification.color" :icon="notification.icon">
      {{ notification.message }}
    </NotificationBar>
  </SectionMain>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from 'vue-router';
import { mdiLock, mdiCheck, mdiAlertCircle } from '@mdi/js';

import SectionMain from '@/components/SectionMain.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import CardBox from '@/components/CardBox.vue';
import FormField from '@/components/FormField.vue';
import FormControl from '@/components/FormControl.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseButtons from '@/components/BaseButtons.vue';
import NotificationBar from '@/components/NotificationBar.vue';

const router = useRouter();
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const notification = ref({ visible: false, message: '', color: 'info', icon: mdiCheck });
const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const isSubmitting = ref(false);

const validateForm = () => {
  let isValid = true;
  errors.currentPassword = '';
  errors.newPassword = '';
  errors.confirmPassword = '';

  if (!currentPassword.value) {
    errors.currentPassword = 'La contraseña actual es requerida';
    isValid = false;
  }

  if (!newPassword.value) {
    errors.newPassword = 'La nueva contraseña es requerida';
    isValid = false;
  } else if (newPassword.value.length < 8) {
    errors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres';
    isValid = false;
  }

  if (!confirmPassword.value) {
    errors.confirmPassword = 'Debe confirmar la nueva contraseña';
    isValid = false;
  } else if (newPassword.value !== confirmPassword.value) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
    isValid = false;
  }

  return isValid;
};

const changePassword = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    showNotification('No se encontró usuario autenticado', 'danger', mdiAlertCircle);
    isSubmitting.value = false;
    return;
  }

  try {
    // Reautenticar al usuario
    const credential = EmailAuthProvider.credential(user.email, currentPassword.value);
    await reauthenticateWithCredential(user, credential);

    // Actualizar la contraseña
    await updatePassword(user, newPassword.value);

    // Actualizar el estado en Firestore
    await updateDoc(doc(db, "publishers", user.uid), {
      needsPasswordChange: false
    });

    showNotification('Contraseña cambiada exitosamente', 'success', mdiCheck);

    // Redirigir al usuario a la página principal después de un breve retraso
    setTimeout(() => {
      router.push('/');
    }, 2000);
  } catch (error) {
    if (error.code === 'auth/wrong-password') {
      errors.currentPassword = 'La contraseña actual es incorrecta';
    } else {
      showNotification(`Error: ${error.message}`, 'danger', mdiAlertCircle);
    }
  } finally {
    isSubmitting.value = false;
  }
};

const showNotification = (message, color, icon) => {
  notification.value = { visible: true, message, color, icon };
  setTimeout(() => {
    notification.value.visible = false;
  }, 5000);
};
</script>
