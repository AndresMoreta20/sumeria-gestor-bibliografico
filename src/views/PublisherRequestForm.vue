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


const todasLasProvincias = {
  "Azuay": {
    "Cuenca": { min: "010101", max: "010166" },
    "Gualaceo": { min: "010201", max: "010206" },
    "Chordeleg": { min: "010301", max: "010304" },
    "Paute": { min: "010401", max: "010406" },
    "Pucará": { min: "010501", max: "010502" },
    "Santa Isabel": { min: "010601", max: "010603" },
    "Sigsig": { min: "010701", max: "010704" },
    "Girón": { min: "010801", max: "010802" },
    "Nabón": { min: "010901", max: "010902" },
    "Oña": { min: "011001", max: "011002" },
    "San Fernando": { min: "011101", max: "011102" },
    "Sevilla de Oro": { min: "011201", max: "011202" },
    "Guachapala": { min: "011301", max: "011302" },
    "Camilo Ponce Enríquez": { min: "011401", max: "011402" }
  },
  "Bolívar": {
    "Guaranda": { min: "020101", max: "020108" },
    "Chillanes": { min: "020201", max: "020202" },
    "Chimbo": { min: "020301", max: "020303" },
    "Echeandía": { min: "020401", max: "020402" },
    "San Miguel": { min: "020501", max: "020503" },
    "Caluma": { min: "020601", max: "020602" },
    "Las Naves": { min: "020701", max: "020702" }
  },
  "Cañar": {
    "Azogues": { min: "030101", max: "030108" },
    "Biblian": { min: "030201", max: "030203" },
    "Cañar": { min: "030301", max: "030303" },
    "La Troncal": { min: "030401", max: "030403" },
    "El Tambo": { min: "030501", max: "030503" },
    "Déleg": { min: "030601", max: "030602" },
    "Suscal": { min: "030701", max: "030702" }
  },
  "Carchi": {
    "Tulcán": { min: "040101", max: "040110" },
    "San Gabriel": { min: "040201", max: "040203" },
    "Bolívar": { min: "040301", max: "040302" },
    "Espejo": { min: "040401", max: "040402" },
    "Mira": { min: "040501", max: "040502" },
    "Montúfar": { min: "040601", max: "040602" },
    "Huaca": { min: "040701", max: "040702" }
  },
  "Chimborazo": {
    "Riobamba": { min: "060101", max: "060163" },
    "Alausí": { min: "060201", max: "060210" },
    "Colta": { min: "060301", max: "060306" },
    "Chambo": { min: "060401", max: "060401" },
    "Chunchi": { min: "060501", max: "060505" },
    "Guamote": { min: "060601", max: "060603" },
    "Guano": { min: "060701", max: "060711" },
    "Pallatanga": { min: "060801", max: "060801" },
    "Penipe": { min: "060901", max: "060907" },
    "Cumandá": { min: "061001", max: "061001" }
  },
  "Cotopaxi": {
    "Latacunga": { min: "050101", max: "050111" },
    "La Maná": { min: "050201", max: "050202" },
    "Pujilí": { min: "050301", max: "050305" },
    "Salcedo": { min: "050401", max: "050405" },
    "Saquisilí": { min: "050501", max: "050502" },
    "Sigchos": { min: "050601", max: "050602" }
  },
  "El Oro": {
    "Machala": { min: "070101", max: "070114" },
    "Arenillas": { min: "070201", max: "070204" },
    "Atahualpa": { min: "070301", max: "070303" },
    "Balsas": { min: "070401", max: "070402" },
    "Chilla": { min: "070501", max: "070502" },
    "El Guabo": { min: "070601", max: "070605" },
    "Huaquillas": { min: "070701", max: "070705" },
    "Las Lajas": { min: "070801", max: "070804" },
    "Marcabelí": { min: "070901", max: "070902" },
    "Pasaje": { min: "071001", max: "071007" },
    "Piñas": { min: "071101", max: "071106" },
    "Portovelo": { min: "071201", max: "071203" },
    "Santa Rosa": { min: "071301", max: "071312" },
    "Zaruma": { min: "071401", max: "071405" }
  },
  "Esmeraldas": {
    "Esmeraldas": { min: "080101", max: "080115" },
    "Eloy Alfaro": { min: "080201", max: "080205" },
    "Muisne": { min: "080301", max: "080305" },
    "Quinindé": { min: "080401", max: "080405" },
    "San Lorenzo": { min: "080501", max: "080505" },
    "Atacames": { min: "080601", max: "080603" },
    "Rioverde": { min: "080701", max: "080703" },
    "La Concordia": { min: "080801", max: "080803" }
  },
  "Galápagos": {
    "San Cristóbal": { min: "200101", max: "200102" },
    "Isabela": { min: "200201", max: "200202" },
    "Santa Cruz": { min: "200301", max: "200302" }
  },
  "Guayas": {
    "Guayaquil": { min: "090101", max: "090920" },
    "Daule": { min: "090201", max: "090208" },
    "Durán": { min: "090301", max: "090310" },
    "Milagro": { min: "090401", max: "090407" },
    "Samborondón": { min: "090501", max: "090508" },
    "Playas": { min: "090601", max: "090603" },
    "Santa Lucía": { min: "090701", max: "090703" },
    "Salitre": { min: "090801", max: "090805" },
    "Balzar": { min: "090901", max: "090903" },
    "El Empalme": { min: "091001", max: "091004" },
    "Balao": { min: "091101", max: "091102" },
    "Colimes": { min: "091201", max: "091203" },
    "Pedro Carbo": { min: "091301", max: "091304" },
    "Naranjal": { min: "091401", max: "091404" },
    "Naranjito": { min: "091501", max: "091503" },
    "Marcelino Maridueña": { min: "091601", max: "091602" },
    "Lomas de Sargentillo": { min: "091701", max: "091702" },
    "Nobol": { min: "091801", max: "091802" },
    "Yaguachi": { min: "091901", max: "091905" },
    "Palestina": { min: "092001", max: "092002" }
  },
  "Imbabura": {
    "Ibarra": { min: "100101", max: "100105" },
    "Otavalo": { min: "100401", max: "100405" },
    "Cotacachi": { min: "100301", max: "100305" },
    "Antonio Ante": { min: "100201", max: "100204" },
    "Pimampiro": { min: "100501", max: "100502" },
    "San Miguel de Urcuquí": { min: "100601", max: "100603" }
  },
  "Loja": {
    "Loja": { min: "110101", max: "110118" },
    "Calvas": { min: "110201", max: "110203" },
    "Catamayo": { min: "110301", max: "110305" },
    "Celica": { min: "110401", max: "110404" },
    "Chaguarpamba": { min: "110501", max: "110502" },
    "Espíndola": { min: "110601", max: "110604" },
    "Gonzanamá": { min: "110701", max: "110703" },
    "Macará": { min: "110801", max: "110803" },
    "Olmedo": { min: "110901", max: "110902" },
    "Paltas": { min: "111001", max: "111003" },
    "Pindal": { min: "111101", max: "111102" },
    "Puyango": { min: "111201", max: "111204" },
    "Quilanga": { min: "111301", max: "111302" },
    "Saraguro": { min: "111401", max: "111404" },
    "Sozoranga": { min: "111501", max: "111502" },
    "Zapotillo": { min: "111601", max: "111604" }
  },
  "Los Ríos": {
    "Babahoyo": { min: "120101", max: "120110" },
    "Baba": { min: "120201", max: "120203" },
    "Montalvo": { min: "120301", max: "120303" },
    "Puebloviejo": { min: "120401", max: "120403" },
    "Quevedo": { min: "120501", max: "120509" },
    "Urdaneta": { min: "120601", max: "120603" },
    "Ventanas": { min: "120701", max: "120704" },
    "Vinces": { min: "120801", max: "120804" },
    "Palenque": { min: "120901", max: "120902" },
    "Buena Fe": { min: "121001", max: "121004" },
    "Valencia": { min: "121101", max: "121102" },
    "Quinsaloma": { min: "121201", max: "121202" }
  },
  "Manabí": {
    "Portoviejo": { min: "130101", max: "130115" },
    "Manta": { min: "130201", max: "130208" },
    "Chone": { min: "130301", max: "130310" },
    "El Carmen": { min: "130401", max: "130405" },
    "Jipijapa": { min: "130501", max: "130508" },
    "Bahía de Caráquez": { min: "130601", max: "130603" },
    "Pedernales": { min: "130701", max: "130705" },
    "Pichincha": { min: "130801", max: "130805" },
    "Rocafuerte": { min: "130901", max: "130902" },
    "Santa Ana": { min: "131001", max: "131005" },
    "Sucre": { min: "131101", max: "131103" },
    "Tosagua": { min: "131201", max: "131202" },
    "24 de Mayo": { min: "131301", max: "131303" },
    "Bolívar": { min: "131401", max: "131403" },
    "Flavio Alfaro": { min: "131501", max: "131503" },
    "Jama": { min: "131601", max: "131603" },
    "Jaramijó": { min: "131701", max: "131702" },
    "San Vicente": { min: "131801", max: "131803" }
  },
  "Morona Santiago": {
    "Macas": { min: "140101", max: "140103" },
    "Gualaquiza": { min: "140201", max: "140203" },
    "Sucúa": { min: "140301", max: "140303" },
    "Huamboya": { min: "140401", max: "140402" },
    "San Juan Bosco": { min: "140501", max: "140503" },
    "Taisha": { min: "140601", max: "140602" },
    "Logroño": { min: "140701", max: "140702" },
    "Pablo Sexto": { min: "140801", max: "140802" },
    "Tiwintza": { min: "140901", max: "140902" }
  },
  "Napo": {
    "Tena": { min: "150101", max: "150104" },
    "Archidona": { min: "150201", max: "150203" },
    "El Chaco": { min: "150301", max: "150303" },
    "Quijos": { min: "150401", max: "150403" },
    "Carlos Julio Arosemena Tola": { min: "150501", max: "150501" }
  },
  "Orellana": {
    "Francisco de Orellana (Coca)": { min: "220101", max: "220105" },
    "Aguarico": { min: "220201", max: "220202" },
    "La Joya de los Sachas": { min: "220301", max: "220305" },
    "Loreto": { min: "220401", max: "220403" }
  },
  "Pastaza": {
    "Puyo": { min: "160101", max: "160104" },
    "Mera": { min: "160201", max: "160202" },
    "Santa Clara": { min: "160301", max: "160302" },
    "Arajuno": { min: "160401", max: "160402" }
  },
  "Pichincha": {
    "Quito": { min: "170101", max: "170608" },
    "Cayambe": { min: "170201", max: "170204" },
    "Mejía": { min: "170301", max: "170308" },
    "Pedro Moncayo": { min: "170401", max: "170405" },
    "Rumiñahui": { min: "170501", max: "170503" },
    "San Miguel de los Bancos": { min: "170601", max: "170601" },
    "Pedro Vicente Maldonado": { min: "170701", max: "170701" },
    "Puerto Quito": { min: "170801", max: "170801" }
  },
  "Santa Elena": {
    "Santa Elena": { min: "240101", max: "240105" },
    "La Libertad": { min: "240201", max: "240202" },
    "Salinas": { min: "240301", max: "240304" }
  },
  "Santo Domingo de los Tsáchilas": {
    "Santo Domingo": { min: "230101", max: "230114" },
    "La Concordia": { min: "230201", max: "230203" }
  },
  "Sucumbíos": {
    "Nueva Loja (Lago Agrio)": { min: "210101", max: "210108" },
    "Cascales": { min: "210201", max: "210203" },
    "Cuyabeno": { min: "210301", max: "210303" },
    "Gonzalo Pizarro": { min: "210401", max: "210403" },
    "Putumayo": { min: "210501", max: "210503" },
    "Shushufindi": { min: "210601", max: "210603" },
    "Sucumbíos": { min: "210701", max: "210703" }
  },
  "Tungurahua": {
    "Ambato": { min: "180101", max: "180109" },
    "Baños de Agua Santa": { min: "180201", max: "180204" },
    "Cevallos": { min: "180301", max: "180302" },
    "Mocha": { min: "180401", max: "180402" },
    "Patate": { min: "180501", max: "180502" },
    "Quero": { min: "180601", max: "180603" },
    "San Pedro de Pelileo": { min: "180701", max: "180706" },
    "Santiago de Píllaro": { min: "180801", max: "180805" },
    "Tisaleo": { min: "180901", max: "180902" }
  },
  "Zamora Chinchipe": {
    "Zamora": { min: "190101", max: "190106" },
    "Chinchipe": { min: "190201", max: "190204" },
    "Nangaritza": { min: "190301", max: "190302" },
    "Yacuambi": { min: "190401", max: "190403" },
    "Yantzaza": { min: "190501", max: "190505" },
    "El Pangui": { min: "190601", max: "190604" },
    "Centinela del Cóndor": { min: "190701", max: "190702" },
    "Palanda": { min: "190801", max: "190802" },
    "Paquisha": { min: "190901", max: "190903" }
  }
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

// const validateZipCodeField = async () => {
//   console.log('Validating zip code field');
//   if (!form.codigoPostal || !form.ciudad) {
//     console.log('Missing required fields for zip code validation');
//     errors.codigoPostal = 'Por favor, complete el código postal y la ciudad.';
//     return false;
//   }

//   console.log(`Calling validateZipCode with: ${form.codigoPostal}, ${form.ciudad}`);
//   const isValid = await validateZipCode(form.codigoPostal, form.ciudad);
//   console.log('Zip code validation result:', isValid);

//   if (!isValid) {
//     errors.codigoPostal = 'El código postal no es válido para la ciudad seleccionada.';
//     return false;
//   }

//   errors.codigoPostal = '';
//   return true;
// };
const validateZipCodeField = () => {
  console.log('Validando código postal');
  if (!form.codigoPostal || !form.ciudad || !form.departamento) {
    console.log('Faltan campos requeridos para la validación del código postal');
    errors.codigoPostal = 'Por favor, complete el código postal, la ciudad y la provincia.';
    return false;
  }

  const codigoPostal = form.codigoPostal;
  const provincia = form.departamento;
  const ciudad = form.ciudad;

  if (!todasLasProvincias[provincia] || !todasLasProvincias[provincia][ciudad]) {
    console.log('Provincia o ciudad no encontrada en las constantes');
    errors.codigoPostal = 'Provincia o ciudad no válida.';
    return false;
  }

  const rango = todasLasProvincias[provincia][ciudad];
  const isValid = codigoPostal >= rango.min && codigoPostal <= rango.max;

  console.log(`Validación del código postal: ${isValid}`);

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

// watch([() => form.codigoPostal, () => form.ciudad], async ([newZipCode, newCity]) => {
//   console.log('Zip code or city changed:', newZipCode, newCity);
//   if (newZipCode && newCity) {
//     console.log('Both fields filled, validating zip code');
//     await validateZipCodeField();
//   } else {
//     console.log('Not all fields filled, skipping validation');
//   }
// });

watch([() => form.codigoPostal, () => form.ciudad, () => form.departamento], () => {
  console.log('Código postal, ciudad o provincia cambiaron');
  if (form.codigoPostal && form.ciudad && form.departamento) {
    console.log('Todos los campos llenos, validando código postal');
    validateZipCodeField();
  } else {
    console.log('No todos los campos están llenos, omitiendo validación');
    errors.codigoPostal = '';
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
