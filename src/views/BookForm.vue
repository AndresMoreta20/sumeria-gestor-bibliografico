<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiBookOutline"
        :title="route.query.bookData ? 'Editar Libro' : 'Nuevo Libro'"
        main
      />
      <CardBox form @submit.prevent="saveBook" class="max-w-5xl mx-auto">
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong class="font-bold">Error!</strong>
          <span v-for="(message, field) in error" :key="field" class="block">{{ message }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Imagen de Portada" class="md:col-span-1">
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
          <FormField label="Libro" class="md:col-span-1">
            <FormFilePicker
              v-model="form.bookFile"
              accept=".pdf,.epub,.mobi"
            />
            <p class="text-sm text-gray-500 mt-1">Sube el archivo del libro (PDF, EPUB, MOBI)</p>
          </FormField>
        </div>
        <BaseDivider />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nombre" :class="{ 'text-red-500': errors.name }" class="md:col-span-1">
            <FormControl
              v-model="form.name"
              type="text"
              placeholder="Nombre del libro"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </FormField>
          <FormField label="Precio" :class="{ 'text-red-500': errors.price }" class="md:col-span-1">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">$</span>
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
          <FormField label="Precio de oferta" :class="{ 'text-red-500': errors.sale_price }" class="md:col-span-1">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">$</span>
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
          <FormField label="Cantidad en Stock" :class="{ 'text-red-500': errors.stock_quantity }" class="md:col-span-1">
            <FormControl
              v-model="form.stock_quantity"
              type="number"
              min="0"
              placeholder="Cantidad en stock"
              :class="{ 'border-red-500': errors.stock_quantity }"
            />
            <p v-if="errors.stock_quantity" class="text-red-500 text-sm mt-1">{{ errors.stock_quantity }}</p>
          </FormField>
          <FormField label="Categoría" :class="{ 'text-red-500': errors.categories }" class="md:col-span-1">
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
          <FormField label="Autor" :class="{ 'text-red-500': errors.author }" class="md:col-span-1">
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
          <FormField label="Idioma" :class="{ 'text-red-500': errors.language }" class="md:col-span-1">
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
          <FormField label="ISBN" :class="{ 'text-red-500': errors.isbn }" class="md:col-span-1">
            <FormControl
              v-model="form.isbn"
              type="text"
              placeholder="ISBN del libro"
              :class="{ 'border-red-500': errors.isbn }"
            />
            <p v-if="errors.isbn" class="text-red-500 text-sm mt-1">{{ errors.isbn }}</p>
          </FormField>
          <FormField label="Editorial" class="md:col-span-1">
            <select
              v-model="form.editorial"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar editorial</option>
              <option
                v-for="publisher in publishers"
                :key="publisher.id"
                :value="publisher.name"
                :selected="publisher.name === form.editorial"
              >
                {{ publisher.name }}
              </option>
            </select>
          </FormField>
        </div>
        <FormField label="Descripción corta" :class="{ 'text-red-500': errors.short_description }" class="mt-6">
          <FormControl
            v-model="form.short_description"
            type="textarea"
            placeholder="Descripción corta del libro"
            :class="{ 'border-red-500': errors.short_description }"
            rows="3"
          />
          <p v-if="errors.short_description" class="text-red-500 text-sm mt-1">{{ errors.short_description }}</p>
        </FormField>
        <FormField label="Descripción" :class="{ 'text-red-500': errors.description }" class="mt-6">
          <FormControl
            v-model="form.description"
            type="textarea"
            placeholder="Descripción completa del libro"
            :class="{ 'border-red-500': errors.description }"
            rows="6"
          />
          <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
        </FormField>
        <template #footer>
          <BaseButtons>
            <BaseButton
              @click="saveBook"
              color="success"
              :label="buttonLabel"
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
  fetchPublishers,
  updateProductById,
  uploadProduct,
} from "@/api/woocommerce";

const route = useRoute();
const router = useRouter();
const bookData = route.query.bookData ? JSON.parse(route.query.bookData) : null;

const form = ref({
  name: bookData ? bookData.name : "",
  price: bookData ? bookData.price : "",
  sale_price: bookData ? bookData.sale_price : "",
  stock_quantity: bookData ? bookData.stock_quantity : "",
  short_description: bookData ? stripHtmlTags(bookData.short_description) : "",
  description: bookData ? stripHtmlTags(bookData.description) : "",
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
  language: bookData
    ? bookData.attributes.find((attr) => attr.name === "Idioma")?.options[0]
    : "",
  bookFile: null,
});

const loading = ref(false);
const errors = ref({});
const imagePreview = ref(bookData ? bookData.images[0]?.src : null);
const categories = ref([]);
const authors = ref([]);
const languages = ref([]);
const publishers = ref([]);

onMounted(async () => {
  try {
    const [categoriesData, authorsData, languagesData, publishersData] = await Promise.all([
      fetchCategories(),
      fetchAuthors(),
      fetchLanguages(),
      fetchPublishers(),
    ]);
    categories.value = categoriesData.data;
    authors.value = authorsData.data;
    languages.value = languagesData.data;
    publishers.value = publishersData;
  } catch (err) {
    console.error("Error fetching data:", err);
  }
});

const saveBook = async () => {
  if (!validateForm()) return;

  loading.value = true;
  errors.value = {};

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

    alert("Libro guardado correctamente");
    router.push("/books");
  } catch (err) {
    console.error("Error saving book:", err);
    errors.value = { general: "Hubo un problema al guardar el libro. Inténtalo de nuevo." };
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
</script>