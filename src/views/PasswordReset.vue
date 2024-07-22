<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="colorsBgLight">
      <div class="flex flex-wrap items-center justify-center w-full h-full p-6 colorsBgLight">
        <CardBox :class="`w-full lg:w-1/2 ${cardClass}`" is-form @submit.prevent="submit">
          <img src="@/assets/sumeria_logo.png" alt="Business Logo" class="w-32 mx-auto my-4" /><br />
          <h2 class="text-center text-2xl font-bold mb-4">Recuperar Contraseña</h2>
          <FormField label="Correo" help="Introduce tu correo electrónico para recuperar tu contraseña">
            <FormControl
              v-model="email"
              :icon="mdiAccount"
              name="email"
              type="email"
              autocomplete="email"
              required
              aria-label="Correo"
            />
          </FormField>
          <template #footer>
            <BaseButtons>
              <BaseButton
                type="submit"
                color="bg-black text-white"
                :label="isLoading ? 'Enviando...' : 'Enviar'"
                class="w-full"
                :disabled="isLoading"
              />
            </BaseButtons>
            <p v-if="successMessage" class="mt-4 text-green-500">{{ successMessage }}</p>
            <p v-if="errorMessage" class="mt-4 text-red-500">{{ errorMessage }}</p>
            <p class="mt-4 text-center">
              <router-link to="/login" class="text-blue-500">Volver al Login</router-link>
            </p>
          </template>
        </CardBox>
        <div class="hidden lg:block w-full lg:w-1/2 text-center p-6">
          <img src="@/assets/sumeria_promo_image-transparent.png" alt="Promotional Image" class="w-84 mx-auto my-4" />
        </div>
      </div>
    </SectionFullScreen>
  </LayoutGuest>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Importa query y where
import { mdiAccount } from "@mdi/js";
import SectionFullScreen from "@/components/SectionFullScreen.vue";
import CardBox from "@/components/CardBox.vue";
import FormField from "@/components/FormField.vue";
import FormControl from "@/components/FormControl.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import LayoutGuest from "@/layouts/LayoutGuest.vue";

const email = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);

const checkUserExists = async (email) => {
  const db = getFirestore();
  const usersCollection = collection(db, "publishers");
  
  // Realiza una consulta básica para obtener todos los documentos
  const querySnapshot = await getDocs(usersCollection);
  console.log("Todos los documentos en la colección 'users':", querySnapshot.docs.map(doc => doc.data()));
  
  // Realiza la consulta para verificar el correo electrónico
  const q = query(usersCollection, where("email", "==", email));
  const emailSnapshot = await getDocs(q);
  console.log("Query Snapshot:", emailSnapshot.docs.map(doc => doc.data())); // Imprime los documentos obtenidos
  return !emailSnapshot.empty;
};

const submit = async () => {
  if (!email.value) {
    errorMessage.value = "El correo es requerido.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const userExists = await checkUserExists(email.value);
    if (!userExists) {
      errorMessage.value = "No existe ningún usuario con este correo.";
    } else {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.value);
      successMessage.value = "Se ha enviado un correo para restablecer la contraseña.";
    }
  } catch (error) {
    console.error("Error al enviar el correo de restablecimiento:", error);
    errorMessage.value = "Hubo un error al enviar el correo de restablecimiento.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Tailwind classes handle most of the styling, additional styles if needed can be added here */
</style>
