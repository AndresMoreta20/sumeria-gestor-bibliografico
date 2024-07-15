<!--BookForm.vue VERSION 2-->

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SectionMain from "@/components/SectionMain.vue";
import CardBox from "@/components/CardBox.vue";
import FormField from "@/components/FormField.vue";
import FormControl from "@/components/FormControl.vue";
import FormFilePicker from "@/components/FormFilePicker.vue";
import BaseDivider from "@/components/BaseDivider.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import { mdiBookOutline } from "@mdi/js";
import {
  fetchCategories,
  fetchAuthors,
  fetchLanguages,
  updateProductById,
  uploadProduct,
} from "@/api/woocommerce";

const route = useRoute();
const router = useRouter();
const bookData = route.query.bookData ? JSON.parse(route.query.bookData) : null;
const errors = ref({}); 

const form = ref({
  name: bookData ? bookData.name : "",
  price: bookData ? bookData.price : "",
  sale_price: bookData ? bookData.sale_price : "",
  stock_quantity: bookData ? bookData.stock_quantity : "",
  short_description: bookData ? bookData.short_description : "",
  description: bookData ? bookData.description : "",
  categories: bookData ? bookData.categories[0]?.id : "",
  author: bookData
    ? bookData.attributes.find((attr) => attr.name === "Autor")?.options[0]
    : "",
  isbn: bookData
    ? bookData.attributes.find((attr) => attr.name === "ISBN")?.options[0]
    : "",
  editorial: bookData
    ? bookData.attributes.find((attr) => attr.name === "Editorial")?.options[0]
    : "",
  image: bookData ? bookData.images[0]?.src : "",
  download_link: bookData ? bookData.downloads[0]?.file : "",
  format: bookData
    ? bookData.attributes.find((attr) => attr.name === "Formato")?.options[0]
    : "",
  language: bookData
    ? bookData.attributes.find((attr) => attr.name === "Idioma")?.options[0]
    : "",
});

const loading = ref(false);
const error = ref(null);
const imagePreview = ref(bookData ? bookData.images[0]?.src : null);
const categories = ref([]);
const authors = ref([]);
const languages = ref([]);

onMounted(async () => {
  try {
    const [categoriesData, authorsData, languagesData] = await Promise.all([
      fetchCategories(),
      fetchAuthors(),
      fetchLanguages(),
    ]);
    categories.value = categoriesData.data;
    authors.value = authorsData.data;
    languages.value = languagesData.data;
  } catch (err) {
    console.error("Error fetching data:", err);
  }
});

const saveBook = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = null;

  try {
    const bookData = {
      name: form.value.name,
      regular_price: form.value.price.toString(),
      sale_price: form.value.sale_price.toString(),
      stock_quantity: parseInt(form.value.stock_quantity),
      short_description: form.value.short_description,
      description: form.value.description,
      categories: [{ id: parseInt(form.value.categories) }],
      images: [{ src: form.value.image }],
      downloads: [{ file: form.value.download_link }],
      attributes: [
        { name: "Autor", options: [form.value.author] },
        { name: "ISBN", options: [form.value.isbn] },
        { name: "Editorial", options: [form.value.editorial] },
        { name: "Formato", options: [form.value.format] },
        { name: "Idioma", options: [form.value.language] },
      ],
    };

    if (form.value.download_link !== bookData.downloads[0]?.file) {
  bookData.downloads = [{ file: form.value.download_link }];
}

if (route.query.bookData) {
  await updateProductById(JSON.parse(route.query.bookData).id, bookData);
} else {
  await uploadProduct(bookData);
}

    if (route.query.bookData) {
      await updateProductById(JSON.parse(route.query.bookData).id, bookData);
    } else {
      await uploadProduct(bookData);
    }

    alert("Libro guardado correctamente");
    router.push("/books");
  } catch (err) {
    console.error("Error saving book:", err);
    error.value = "Hubo un problema al guardar el libro. Inténtalo de nuevo.";
  } finally {
    loading.value = false;
  }
};

const handleImageChange = (file) => {
  form.value.image = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const cancel = () => {
  router.push("/books");
};

const buttonLabel = computed(() =>
  route.query.bookData ? "Actualizar Libro" : "Crear Libro"
);
const stripHtmlTags = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};


const validateForm = () => {
  errors.value = {};
  if (!form.value.name) errors.value.name = "El nombre es requerido";
  if (!form.value.price) errors.value.price = "El precio es requerido";
  if (!form.value.stock_quantity) errors.value.stock_quantity = "La cantidad en stock es requerida";
  if (!form.value.categories) errors.value.categories = "La categoría es requerida";
  if (!form.value.author) errors.value.author = "El autor es requerido";
  if (!form.value.language) errors.value.language = "El idioma es requerido";
  if (!form.value.isbn) errors.value.isbn = "El ISBN es requerido";
  if (!form.value.short_description) errors.value.short_description = "La descripción corta es requerida";
  if (!form.value.description) errors.value.description = "La descripción es requerida";
  
  if (parseFloat(form.value.sale_price) > parseFloat(form.value.price)) {
    errors.value.sale_price = "El precio de oferta no puede ser mayor al precio regular";
  }

  return Object.keys(errors.value).length === 0;
};

// Validación activa
watch(form, () => {
  validateForm();
}, { deep: true });

// Función para eliminar etiquetas HTML

// Procesar descripciones al cargar los datos
onMounted(() => {
  if (bookData) {
    form.value.short_description = stripHtmlTags(form.value.short_description);
    form.value.description = stripHtmlTags(form.value.description);
  }
});


</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiBookOutline"
        :title="route.query.bookData ? 'Editar Libro' : 'Nuevo Libro'"
        main
      />
      <CardBox form @submit.prevent="saveBook" class="max-w-3xl mx-auto">
        <div
          v-if="error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong class="font-bold">Error!</strong>
          <span v-for="(message, field) in error" :key="field" class="block">{{
            message
          }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> 
          <FormField label="Imagen de Portada">
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Vista previa de portada"
              class="max-w-full h-40 object-contain mb-2"
            />
            <FormFilePicker
              v-model="form.image"
              @update:modelValue="handleImageChange"
              accept="image/*"
            />
          </FormField>
          <FormField label="Libro">
            <a
              v-if="form.download_link"
              :href="form.download_link"
              target="_blank"
              class="text-blue-500 underline"
              >Descargar libro</a
            >
          </FormField>
        </div>
        <BaseDivider />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nombre" :class="{ 'text-red-500': errors.name }">
            <FormControl
              v-model="form.name"
              type="text"
              placeholder="Nombre del libro"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </FormField>
          <FormField label="Precio" :class="{ 'text-red-500': errors.price }">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                $
              </span>
              <FormControl
                v-model="form.price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Precio del libro"
                class="pl-7"
                :class="{ 'border-red-500': errors.price }"
              />
            </div>
            <p v-if="errors.price" class="text-red-500 text-sm mt-1">{{ errors.price }}</p>
          </FormField>
          <FormField label="Precio de oferta" :class="{ 'text-red-500': errors.sale_price }">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                $
              </span>
              <FormControl
                v-model="form.sale_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Precio de oferta"
                class="pl-7"
                :class="{ 'border-red-500': errors.sale_price }"
              />
            </div>
            <p v-if="errors.sale_price" class="text-red-500 text-sm mt-1">{{ errors.sale_price }}</p>
          </FormField>
          <!-- ... (otros campos del formulario) -->
          <FormField label="Categoría" :class="{ 'text-red-500': errors.categories }">
            <select
              v-model="form.categories"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.categories }"
            >
              <option value="">Seleccionar categoría</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
                :selected="category.id === parseInt(form.categories)"
              >
                {{ category.name }}
              </option>
            </select>
            <p v-if="errors.categories" class="text-red-500 text-sm mt-1">{{ errors.categories }}</p>
          </FormField>
          <FormField label="Autor" :class="{ 'text-red-500': errors.author }">
            <select
              v-model="form.author"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.author }"
            >
              <option value="">Seleccionar autor</option>
              <option
                v-for="author in authors"
                :key="author.id"
                :value="author.name"
                :selected="author.name === form.author"
              >
                {{ author.name }}
              </option>
            </select>
            <p v-if="errors.author" class="text-red-500 text-sm mt-1">{{ errors.author }}</p>
          </FormField>
          <FormField label="Idioma" :class="{ 'text-red-500': errors.language }">
            <select
              v-model="form.language"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.language }"
            >
              <option value="">Seleccionar idioma</option>
              <option
                v-for="language in languages"
                :key="language.id"
                :value="language.name"
                :selected="language.name === form.language"
              >
                {{ language.name }}
              </option>
            </select>
            <p v-if="errors.language" class="text-red-500 text-sm mt-1">{{ errors.language }}</p>
          </FormField>
        </div>
        <FormField label="Descripción corta" :class="{ 'text-red-500': errors.short_description }">
          <FormControl
            v-model="form.short_description"
            type="textarea"
            placeholder="Descripción corta del libro"
            :class="{ 'border-red-500': errors.short_description }"
          />
          <p v-if="errors.short_description" class="text-red-500 text-sm mt-1">{{ errors.short_description }}</p>
        </FormField>
        <FormField label="Descripción" :class="{ 'text-red-500': errors.description }">
          <FormControl
            v-model="form.description"
            type="textarea"
            placeholder="Descripción completa del libro"
            :class="{ 'border-red-500': errors.description }"
          />
          <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
        </FormField>
        <FormField label="Descripción" :error="error?.description">
          <FormControl
            v-model="form.description"
            type="textarea"
            placeholder="Descripción completa del libro"
            @input="form.description = stripHtmlTags($event.target.value)"
          />
        </FormField>
        <template #footer>
          <BaseButtons>
            <BaseButton
              @click="saveBook"
              color="success"
              label="Test Save Book"
              :disabled="loading"
            />
            <BaseButton
              v-if="loading"
              color="info"
              label="Guardando..."
              disabled
            />
            <BaseButton
              @click="cancel"
              color="danger"
              label="Cancelar"
              outline
              :disabled="loading"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
