<template>
  <SectionMain>
    <SectionTitleLineWithButton :icon="mdiLock" title="Cambiar Contraseña" main />
    
    <CardBox class="mb-6">
      <form @submit.prevent="changePassword">
        <FormField label="Contraseña Actuals *" help="Campo obligatorio">
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
        <FormField label="Nueva Contraseña *" help="Campo obligatorio">
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
        <FormField label="Confirmar Nueva Contraseña *" help="Campo obligatorio">
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
  
  const newPassword = ref('');
  
  const changePassword = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    try {
      await updatePassword(user, newPassword.value);
      await updateDoc(doc(db, "publishers", user.uid), {
        needsPasswordChange: false
      });
      // Redirigir al usuario a la página principal o recargar la aplicación
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
    }
  };
  </script>