<template>
  <LayoutGuest>
    <SectionMain>
      <CardBox class="max-w-lg mx-auto my-10" is-form @submit.prevent="submit">
        <h2 class="text-center text-2xl font-bold mb-6">Formulario de Solicitud</h2>

        <p class="text-center mb-6">Fecha de solicitud: {{ form.solicitudDate }}</p>

        <FormField label="RUC" help="RUC">
          <input v-model="form.ruc" name="ruc" required class="form-input w-full" />
        </FormField>
        <FormField label="Razón social de la editorial" help="Razón social">
          <input v-model="form.razonSocial" name="razonSocial" required class="form-input w-full" />
        </FormField>
        <FormField label="Correo electrónico" help="Correo electrónico">
          <input v-model="form.email" name="email" type="email" required class="form-input w-full" />
        </FormField>
        <FormField label="Sigla" help="Sigla">
          <input v-model="form.sigla" name="sigla" class="form-input w-full" />
        </FormField>

        <FormField label="Provincia" help="Provincia">
          <select v-model="form.departamento" name="departamento" required class="form-select w-full">
            <option value="" disabled selected>Seleccione una provincia</option>
            <option v-for="provincia in provincias" :key="provincia" :value="provincia">{{ provincia }}</option>
          </select>
        </FormField>

        <FormField label="Ciudad" help="Ciudad">
          <input v-model="form.ciudad" name="ciudad" required class="form-input w-full" />
        </FormField>

        <FormField label="Dirección" help="Dirección">
          <input v-model="form.direccion" name="direccion" required class="form-input w-full" />
        </FormField>

        <FormField label="Código Postal" help="Código Postal">
          <input v-model="form.codigoPostal" name="codigoPostal" type="text" required class="form-input w-full" />
        </FormField>

        <FormField label="Teléfono" help="Teléfono">
          <input v-model="form.telefono" name="telefono" type="tel" required class="form-input w-full" />
        </FormField>

        <FormField label="Página web o URL" help="Página web">
          <input v-model="form.paginaWeb" name="paginaWeb" type="url" class="form-input w-full" />
        </FormField>

        <template #footer>
          <BaseButtons class="flex flex-col">
            <BaseButton v-if="!loading" @click="submit" color="bg-black text-white" label="Enviar" class="w-full mb-2" />
            <BaseButton v-if="loading" color="bg-black text-white" label="Cargando..." disabled class="w-full mb-2" />
            <BaseButton @click="cancel" color="bg-gray-500 text-white" label="Cancelar" class="w-full" />
          </BaseButtons>
          <p v-if="errorMessage" class="mt-4 text-red-500">{{ errorMessage }}</p>
          <p v-if="successMessage" class="mt-4 text-green-500">{{ successMessage }}</p>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutGuest>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import SectionMain from '@/components/SectionMain.vue';
import CardBox from '@/components/CardBox.vue';
import FormField from '@/components/FormField.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseButtons from '@/components/BaseButtons.vue';
import LayoutGuest from '@/layouts/LayoutGuest.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = reactive({
  solicitudDate: new Date().toISOString().split('T')[0],
  ruc: '',
  razonSocial: '',
  sigla: '',
  departamento: '',
  ciudad: '',
  direccion: '',
  codigoPostal: '',
  telefono: '',
  paginaWeb: '',
  email: '',
});

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const provincias = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro',
  'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí',
  'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Sucumbíos',
  'Tungurahua', 'Zamora Chinchipe'
];

const submit = async () => {
  // Validación de campos obligatorios
  if (!form.email || !form.razonSocial || !form.ruc) {
    errorMessage.value = 'Por favor complete todos los campos obligatorios';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const db = getFirestore();
    const requestRef = collection(db, 'newPublisherRequest');
    await addDoc(requestRef, {
      ...form,
      solicitudDate: form.solicitudDate
    });
    successMessage.value = '¡Tu solicitud ha sido enviada exitosamente!';
    setTimeout(() => {
      router.push('/login'); // Redirigir a la página de inicio de sesión
    }, 2000);
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    errorMessage.value = error.message || 'Error al enviar la solicitud';
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  router.push('/login'); // Redirigir a la página de inicio de sesión
};
</script>

<style scoped>
.form-select, .form-input {
  @apply block w-full px-3 py-2 mb-4 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300;
}
</style>
