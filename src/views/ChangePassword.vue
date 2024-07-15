<template>
   
      <SectionMain>
        <SectionTitleLineWithButton :icon="mdiLock" title="Cambiar Contraseña" main />
        
        <CardBox class="mb-6">
          <FormField label="Nueva Contraseña">
            <FormControl
              v-model="newPassword"
              type="password"
              placeholder="Ingrese su nueva contraseña"
              :icon="mdiLock"
            />
          </FormField>
          <FormField label="Confirmar Nueva Contraseña">
            <FormControl
              v-model="confirmPassword"
              type="password"
              placeholder="Confirme su nueva contraseña"
              :icon="mdiLock"
            />
          </FormField>
          <template #footer>
            <BaseButtons>
              <BaseButton
                color="info"
                :icon="mdiCheck"
                label="Cambiar Contraseña"
                @click="changePassword"
              />
            </BaseButtons>
          </template>
        </CardBox>
  
        <NotificationBar v-if="notification.visible" :color="notification.color" :icon="notification.icon">
          {{ notification.message }}
        </NotificationBar>
      </SectionMain>

  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { getAuth, updatePassword } from "firebase/auth";
  import { doc, updateDoc } from "firebase/firestore";
  import { db } from "@/firebase";
  import { useRouter } from 'vue-router';
  import { mdiLock, mdiCheck, mdiAlertCircle } from '@mdi/js';
  
  import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
  import SectionMain from '@/components/SectionMain.vue';
  import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
  import CardBox from '@/components/CardBox.vue';
  import FormField from '@/components/FormField.vue';
  import FormControl from '@/components/FormControl.vue';
  import BaseButton from '@/components/BaseButton.vue';
  import BaseButtons from '@/components/BaseButtons.vue';
  import NotificationBar from '@/components/NotificationBar.vue';
  
  const router = useRouter();
  const newPassword = ref('');
  const confirmPassword = ref('');
  const notification = ref({ visible: false, message: '', color: 'info', icon: mdiCheck });
  
  const changePassword = async () => {
    console.log('Iniciando proceso de cambio de contraseña');
    
    if (newPassword.value !== confirmPassword.value) {
      console.log('Las contraseñas no coinciden');
      showNotification('Las contraseñas no coinciden', 'danger', mdiAlertCircle);
      return;
    }
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.log('No se encontró usuario autenticado');
      showNotification('No se encontró usuario autenticado', 'danger', mdiAlertCircle);
      return;
    }
  
    try {
      console.log('Actualizando contraseña en Firebase Auth');
      await updatePassword(user, newPassword.value);
      
      console.log('Actualizando estado en Firestore');
      await updateDoc(doc(db, "publishers", user.uid), {
        needsPasswordChange: false
      });
      
      console.log('Contraseña cambiada exitosamente');
      showNotification('Contraseña cambiada exitosamente', 'success', mdiCheck);
      
      // Redirigir al usuario a la página principal después de un breve retraso
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      showNotification(`Error: ${error.message}`, 'danger', mdiAlertCircle);
    }
  };
  
  const showNotification = (message, color, icon) => {
    notification.value = { visible: true, message, color, icon };
    setTimeout(() => {
      notification.value.visible = false;
    }, 5000);
  };
  </script>