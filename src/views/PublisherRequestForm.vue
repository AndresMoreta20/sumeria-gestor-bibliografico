<template>
  <LayoutGuest>
    <SectionMain>
      <CardBox class="max-w-lg mx-auto my-10" is-form @submit.prevent="submit">
        <h2 class="text-center text-2xl font-bold mb-6">Formulario de Solicitud</h2>

        <p class="text-center mb-6">Fecha de solicitud: {{ form.solicitudDate }}</p>

        <FormField label="RUC" help="RUC">
          <input v-model="form.ruc" name="ruc" required class="form-input w-full" />
          <p v-if="errors.ruc" class="text-red-500">{{ errors.ruc }}</p>
        </FormField>
        <FormField label="Razón social de la editorial" help="Razón social">
          <input v-model="form.razonSocial" name="razonSocial" required class="form-input w-full" />
          <p v-if="errors.razonSocial" class="text-red-500">{{ errors.razonSocial }}</p>
        </FormField>
        <FormField label="Correo electrónico" help="Correo electrónico">
          <input v-model="form.email" name="email" type="email" required class="form-input w-full" />
          <p v-if="errors.email" class="text-red-500">{{ errors.email }}</p>
        </FormField>
        <FormField label="Sigla" help="Sigla">
          <input v-model="form.sigla" name="sigla" class="form-input w-full" />
          <p v-if="errors.sigla" class="text-red-500">{{ errors.sigla }}</p>
        </FormField>

        <FormField label="Provincia" help="Provincia">
          <select v-model="form.departamento" name="departamento" required class="form-select w-full" @change="updateCiudades">
            <option value="" disabled selected>Seleccione una provincia</option>
            <option v-for="provincia in provincias" :key="provincia" :value="provincia">{{ provincia }}</option>
          </select>
          <p v-if="errors.departamento" class="text-red-500">{{ errors.departamento }}</p>
        </FormField>

        <FormField label="Ciudad" help="Ciudad">
          <select v-model="form.ciudad" name="ciudad" required class="form-select w-full" :disabled="!form.departamento">
            <option value="" disabled selected>Seleccione una ciudad</option>
            <option v-for="ciudad in ciudadesDisponibles" :key="ciudad" :value="ciudad">{{ ciudad }}</option>
          </select>
          <p v-if="errors.ciudad" class="text-red-500">{{ errors.ciudad }}</p>
        </FormField>

        <FormField label="Dirección" help="Dirección">
          <input v-model="form.direccion" name="direccion" required class="form-input w-full" />
          <p v-if="errors.direccion" class="text-red-500">{{ errors.direccion }}</p>
        </FormField>

        <FormField label="Código Postal" help="Código Postal">
          <input v-model="form.codigoPostal" name="codigoPostal" type="text" required class="form-input w-full" />
          <p v-if="errors.codigoPostal" class="text-red-500">{{ errors.codigoPostal }}</p>
        </FormField>

        <FormField label="Teléfono" help="Teléfono">
          <input v-model="form.telefono" name="telefono" type="tel" required class="form-input w-full" />
          <p v-if="errors.telefono" class="text-red-500">{{ errors.telefono }}</p>
        </FormField>

        <FormField label="Página web o URL" help="Página web">
          <input v-model="form.paginaWeb" name="paginaWeb" type="url" class="form-input w-full" />
          <p v-if="errors.paginaWeb" class="text-red-500">{{ errors.paginaWeb }}</p>
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
import { reactive, ref, computed, watch } from 'vue';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import SectionMain from '@/components/SectionMain.vue';
import CardBox from '@/components/CardBox.vue';
import FormField from '@/components/FormField.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseButtons from '@/components/BaseButtons.vue';
import LayoutGuest from '@/layouts/LayoutGuest.vue';
import { useRouter } from 'vue-router';
import { checkDuplicatePublisherData } from '@/api/firebase';
import { validateZipCode } from '@/utils/zipcode';


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

const errors = reactive({
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
  codigoPostal:'',
});

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const provinciasYCiudades = {
  'Azuay': ['Cuenca', 'Gualaceo', 'Paute', 'Sígsig', 'Santa Isabel', 'Chordeleg', 'Girón', 'Nabón', 'Pucará', 'San Fernando', 'Oña', 'Guachapala', 'El Pan', 'Sevilla de Oro'],
  'Bolívar': ['Guaranda', 'San Miguel', 'Chillanes', 'Chimbo', 'Echeandía', 'Caluma', 'Las Naves'],
  'Cañar': ['Azogues', 'Biblián', 'La Troncal', 'Cañar', 'El Tambo', 'Déleg', 'Suscal'],
  'Carchi': ['Tulcán', 'San Gabriel', 'Huaca', 'Espejo', 'Mira', 'Bolívar'],
  'Chimborazo': ['Riobamba', 'Alausí', 'Guano', 'Colta', 'Chunchi', 'Chambo', 'Pallatanga', 'Guamote', 'Cumandá', 'Penipe'],
  'Cotopaxi': ['Latacunga', 'La Maná', 'Salcedo', 'Pujilí', 'Saquisilí', 'Pangua', 'Sigchos'],
  'El Oro': ['Machala', 'Santa Rosa', 'Pasaje', 'Huaquillas', 'El Guabo', 'Arenillas', 'Piñas', 'Zaruma', 'Portovelo', 'Balsas', 'Marcabelí', 'Paccha', 'Chilla', 'Atahualpa'],
  'Esmeraldas': ['Esmeraldas', 'Quinindé', 'Atacames', 'Muisne', 'Río Verde', 'Eloy Alfaro', 'San Lorenzo'],
  'Galápagos': ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'],
  'Guayas': ['Guayaquil', 'Durán', 'Milagro', 'Daule', 'El Empalme', 'Samborondón', 'Naranjal', 'Balzar', 'Salitre', 'El Triunfo', 'Playas', 'Yaguachi', 'Naranjito', 'Coronel Marcelino Maridueña', 'Bucay', 'Palestina', 'Santa Lucía', 'Pedro Carbo', 'Lomas de Sargentillo', 'Nobol', 'Colimes', 'Balao', 'Isidro Ayora', 'Simón Bolívar'],
  'Imbabura': ['Ibarra', 'Otavalo', 'Atuntaqui', 'Cotacachi', 'Pimampiro', 'Urcuquí'],
  'Loja': ['Loja', 'Catamayo', 'Cariamanga', 'Macará', 'Catacocha', 'Celica', 'Saraguro', 'Alamor', 'Zapotillo', 'Pindal', 'Quilanga', 'Olmedo', 'Chaguarpamba', 'Sozoranga'],
  'Los Ríos': ['Babahoyo', 'Quevedo', 'Ventanas', 'Vinces', 'Buena Fe', 'Valencia', 'Mocache', 'Puebloviejo', 'Urdaneta', 'Montalvo', 'Palenque', 'Baba'],
  'Manabí': ['Portoviejo', 'Manta', 'Chone', 'Jipijapa', 'El Carmen', 'Bahía de Caráquez', 'Calceta', 'Pedernales', 'Tosagua', 'Rocafuerte', 'Puerto López', 'Junín', 'Pichincha', 'Paján', 'Santa Ana', 'Flavio Alfaro', 'Jaramijó', 'Jama', 'San Vicente', 'Olmedo', 'Montecristi'],
  'Morona Santiago': ['Macas', 'Sucúa', 'Gualaquiza', 'Limón Indanza', 'Santiago', 'Palora', 'Taisha', 'Logroño', 'Pablo Sexto', 'Tiwintza', 'Huamboya', 'San Juan Bosco'],
  'Napo': ['Tena', 'Archidona', 'El Chaco', 'Quijos', 'Carlos Julio Arosemena Tola'],
  'Orellana': ['Francisco de Orellana', 'La Joya de los Sachas', 'Loreto', 'Aguarico'],
  'Pastaza': ['Puyo', 'Mera', 'Santa Clara', 'Arajuno'],
  'Pichincha': ['Quito', 'Sangolquí', 'Cayambe', 'Machachi', 'Tabacundo', 'Pedro Vicente Maldonado', 'San Miguel de los Bancos', 'Puerto Quito'],
  'Santa Elena': ['Santa Elena', 'La Libertad', 'Salinas'],
  'Santo Domingo de los Tsáchilas': ['Santo Domingo'],
  'Sucumbíos': ['Nueva Loja', 'Shushufindi', 'Cascales', 'Gonzalo Pizarro', 'Putumayo', 'Cuyabeno', 'Sucumbíos'],
  'Tungurahua': ['Ambato', 'Baños', 'Pelileo', 'Píllaro', 'Patate', 'Quero', 'Cevallos', 'Mocha', 'Tisaleo'],
  'Zamora Chinchipe': ['Zamora', 'Yantzaza', 'Centinela del Cóndor', 'Zumba', 'Palanda', 'Paquisha', 'Yacuambi', 'El Pangui', 'Nangaritza']
};

const provincias = Object.keys(provinciasYCiudades);

const ciudadesDisponibles = computed(() => {
  return form.departamento ? provinciasYCiudades[form.departamento] : [];
});

const updateCiudades = () => {
  form.ciudad = '';
};

const validateRuc = (ruc) => {
  if (ruc.length !== 13 || !/^\d{13}$/.test(ruc)) {
    errors.ruc = "El RUC debe tener 13 dígitos y ser válido para Ecuador.";
    return false;
  }
  
  const provinceCode = parseInt(ruc.substring(0, 2));
  if (provinceCode < 1 || provinceCode > 24) {
    errors.ruc = "El código de provincia del RUC no es válido.";
    return false;
  }

  const thirdDigit = parseInt(ruc[2]);
  
  if (thirdDigit < 6) {
    if (!validateNaturalPerson(ruc)) {
      errors.ruc = "El RUC no es válido.";
      return false;
    }
  } else if (thirdDigit === 6) {
    if (!validatePublicCompany(ruc)) {
      errors.ruc = "El RUC no es válido.";
      return false;
    }
  } else if (thirdDigit === 9) {
    if (!validatePrivateCompany(ruc)) {
      errors.ruc = "El RUC no es válido.";
      return false;
    }
  } else {
    errors.ruc = "El tercer dígito del RUC no es válido.";
    return false;
  }

  errors.ruc = '';
  return true;
};

const validateNaturalPerson = (ruc) => {
  const cedula = ruc.substring(0, 10);
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;

  for (let i = 0; i < 9; i++) {
    let value = parseInt(cedula[i]) * coefficients[i];
    if (value > 9) value -= 9;
    total += value;
  }

  const checkDigit = 10 - (total % 10);
  return (checkDigit === 10 ? 0 : checkDigit) === parseInt(cedula[9]);
};

const validatePublicCompany = (ruc) => {
  const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
  let total = 0;

  for (let i = 0; i < 8; i++) {
    total += parseInt(ruc[i]) * coefficients[i];
  }

  const checkDigit = 11 - (total % 11);
  return (checkDigit === 11 ? 0 : checkDigit) === parseInt(ruc[8]);
};

const validatePrivateCompany = (ruc) => {
  const coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
  let total = 0;

  for (let i = 0; i < 9; i++) {
    total += parseInt(ruc[i]) * coefficients[i];
  }

  const checkDigit = 11 - (total % 11);
  return (checkDigit === 11 ? 0 : checkDigit) === parseInt(ruc[9]);
};

const validateEmail = (email) => {
  // Expresión regular basada en el estándar RFC 5322
  const regex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

  if (!regex.test(email)) {
    errors.email = "Por favor, ingrese un correo electrónico válido.";
    return false;
  }

  // Verificaciones adicionales
  const [localPart, domain] = email.split('@');

  // Verificar longitud del correo completo
  if (email.length > 254) {
    errors.email = "El correo electrónico es demasiado largo.";
    return false;
  }

  // Verificar longitud de la parte local
  if (localPart.length > 64) {
    errors.email = "La parte local del correo es demasiado larga.";
    return false;
  }

  // Verificar dominio
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
    errors.email = "El dominio del correo contiene caracteres no permitidos.";
    return false;
  }

  // Verificar que el dominio tenga al menos un punto
  if (!domain.includes('.')) {
    errors.email = "El dominio del correo no es válido.";
    return false;
  }

  errors.email = '';
  return true;
};

const validatePhoneNumber = (phone) => {
  const mobileRegex = /^09\d{8}$/;
  const landlineRegex = /^0[2-7]\d{7}$/;

  if (mobileRegex.test(phone) || landlineRegex.test(phone)) {
    errors.telefono = '';
    return true;
  }

  errors.telefono = "Ingrese un número de teléfono válido de Ecuador (09 para celulares, 02/03/04/05/06/07 para fijos).";
  return false;
};

const validateWebsite = (url) => {
  if (!url) {
    errors.paginaWeb = '';
    return true;  // La página web es opcional
  }

  const regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!regex.test(url)) {
    errors.paginaWeb = "Ingrese una URL válida (ej. www.ejemplo.com).";
    return false;
  }

  errors.paginaWeb = '';
  return true;
};

const validateZipCodeField = async () => {
  console.log('Validating zip code field');
  if (!form.codigoPostal || !form.ciudad) {
    console.log('Missing required fields for zip code validation');
    errors.codigoPostal = 'Por favor, complete el código postal y la ciudad.';
    return false;
  }

  console.log(`Calling validateZipCode with: ${form.codigoPostal}, ${form.ciudad}`);
  const isValid = await validateZipCode(form.codigoPostal, form.ciudad);
  console.log('Zip code validation result:', isValid);

  if (!isValid) {
    errors.codigoPostal = 'El código postal no es válido para la ciudad seleccionada.';
    return false;
  }

  errors.codigoPostal = '';
  return true;
};

// Watchers para validación en tiempo real
watch(() => form.ruc, (newValue) => validateRuc(newValue));
watch(() => form.razonSocial, (newValue) => {
  if (newValue.length < 3 || newValue.length > 100) {
    errors.razonSocial = "La razón social debe tener entre 3 y 100 caracteres.";
  } else {
    errors.razonSocial = '';
  }
});
watch(() => form.email, (newValue) => validateEmail(newValue));
watch(() => form.sigla, (newValue) => {
  if (newValue.length > 10) {
    errors.sigla = "La sigla no debe exceder los 10 caracteres.";
  } else {
    errors.sigla = '';
  }
});
watch(() => form.departamento, (newValue) => {
  if (!newValue) {
    errors.departamento = "Por favor, seleccione una provincia.";
  } else {
    errors.departamento = '';
  }
});
watch(() => form.ciudad, (newValue) => {
  if (!newValue) {
    errors.ciudad = "Por favor, seleccione una ciudad.";
  } else {
    errors.ciudad = '';
  }
});
watch(() => form.direccion, (newValue) => {
  if (newValue.length < 5) {
    errors.direccion = "La dirección debe tener al menos 5 caracteres.";
  } else {
    errors.direccion = '';
  }
});

watch([() => form.codigoPostal, () => form.ciudad], async ([newZipCode, newCity]) => {
  console.log('Zip code or city changed:', newZipCode, newCity);
  if (newZipCode && newCity) {
    console.log('Both fields filled, validating zip code');
    await validateZipCodeField();
  } else {
    console.log('Not all fields filled, skipping validation');
  }
});

watch(() => form.telefono, (newValue) => validatePhoneNumber(newValue));
watch(() => form.paginaWeb, (newValue) => validateWebsite(newValue));

const submit = async () => {
  const isValid = validateRuc(form.ruc) &&
                  validateEmail(form.email) &&
                  validatePhoneNumber(form.telefono) &&
                  validateWebsite(form.paginaWeb) &&
                  await validateZipCodeField();

                  console.log('Form validation result:', isValid);

  if (!isValid) {
    errorMessage.value = 'Por favor, corrija los errores en el formulario antes de enviar.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const duplicateCheck = await checkDuplicatePublisherData({ 
      name: form.ruc, 
      razonSocial: form.razonSocial, 
      email: form.email 
    });

    if (duplicateCheck.nameExists) {
      errorMessage.value = 'El RUC ya ha sido utilizado en una solicitud previa o está registrado.';
      loading.value = false;
      return;
    }
    if (duplicateCheck.razonSocialExists) {
      errorMessage.value = 'La razón social ya ha sido utilizada en una solicitud previa o está registrada.';
      loading.value = false;
      return;
    }
    if (duplicateCheck.emailExists) {
      errorMessage.value = 'El correo electrónico ya ha sido utilizado en una solicitud previa o está registrado.';
      loading.value = false;
      return;
    }

    const db = getFirestore();
    const requestRef = collection(db, 'newPublisherRequest');
    await addDoc(requestRef, {
      ...form,
      solicitudDate: form.solicitudDate
    });
    successMessage.value = '¡Tu solicitud ha sido enviada exitosamente!';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    errorMessage.value = error.message || 'Error al enviar la solicitud';
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  router.push('/login');
};
</script>

<style scoped>
.form-select, .form-input {
  @apply block w-full px-3 py-2 mb-4 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300;
}
</style>
