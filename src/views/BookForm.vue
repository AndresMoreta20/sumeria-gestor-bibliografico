<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiBookOutline"
        :title="route.query.bookData ? 'Editar Libro' : 'Nuevo Libro'"
        main
      />
      <CardBox form @submit.prevent="saveBook" class="max-w-5xl mx-auto">
        <div v-if="errors.general" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong class="font-bold">Error!</strong>
          <span class="block">{{ errors.general }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Imagen de Portada" class="md:col-span-1">
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Vista previa de portada"
              class="max-w-full h-40 object-contain mb-2"
            />
            <FormFilePicker
              v-model="form.imageFile"
              @update:modelValue="handleImageChange"
              accept="image/*"
            />
          </FormField>
          <FormField label="Archivo del Libro" class="md:col-span-1">
            <FormFilePicker
              v-model="form.bookFile"
              @update:modelValue="handleBookFileChange"
              accept=".pdf,.epub,.mobi"
            />
            <p class="text-sm text-gray-500 mt-1">Sube el archivo del libro (PDF, EPUB, MOBI)</p>
            <a v-if="form.downloads[0]?.file" :href="form.downloads[0].file" target="_blank" class="text-blue-500 underline mt-2 inline-block">
              Descargar archivo actual
            </a>
          </FormField>
        </div>
        <BaseDivider />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Nombre" :class="{ 'text-red-500': errors.name }" class="md:col-span-1">
            <FormControl
              v-model="form.name"
              type="text"
              placeholder="Nombre del libro"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </FormField>
          <FormField label="Precio" :class="{ 'text-red-500': errors.regular_price }" class="md:col-span-1">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">$</span>
              <FormControl
                v-model="form.regular_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Precio del libro"
                class="pl-7"
                :class="{ 'border-red-500': errors.regular_price }"
              />
            </div>
            <p v-if="errors.regular_price" class="text-red-500 text-sm mt-1">{{ errors.regular_price }}</p>
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
          
          <FormField label="Categoría" :class="{ 'text-red-500': errors.categories }" class="md:col-span-1">
            <select
              v-model="form.categories[0]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.categories }"
              @change="handleCategoryChange"
            >
              <option value="">Seleccionar categoría</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
              <option value="other">Otra</option>
            </select>
            <input
              v-if="showNewCategoryInput"
              v-model="newCategory"
              type="text"
              placeholder="Nueva categoría"
              class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p v-if="errors.categories" class="text-red-500 text-sm mt-1">{{ errors.categories }}</p>
          </FormField>
          <FormField label="Autor" :class="{ 'text-red-500': errors.author }" class="md:col-span-1">
            <select
              v-model="form.attributes[0].options[0]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.author }"
              @change="handleAuthorChange"
            >
              <option value="">Seleccionar autor</option>
              <option
                v-for="author in authors"
                :key="author.id"
                :value="author.name"
              >
                {{ author.name }}
              </option>
              <option value="other">Otro</option>
            </select>
            <input
              v-if="showNewAuthorInput"
              v-model="newAuthor"
              type="text"
              placeholder="Nuevo autor"
              class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p v-if="errors.author" class="text-red-500 text-sm mt-1">{{ errors.author }}</p>
          </FormField>
          <FormField label="ISBN" :class="{ 'text-red-500': errors.isbn }" class="md:col-span-1">
            <FormControl
              v-model="form.attributes[1].options[0]"
              type="text"
              placeholder="ISBN del libro"
              :class="{ 'border-red-500': errors.isbn }"
            />
            <p v-if="errors.isbn" class="text-red-500 text-sm mt-1">{{ errors.isbn }}</p>
          </FormField>
          <FormField label="Editorial" class="md:col-span-1">
            <select
              v-model="form.attributes[2].options[0]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handlePublisherChange"
            >
              <option value="">Seleccionar editorial</option>
              <option
                v-for="publisher in publishers"
                :key="publisher.id"
                :value="publisher.name"
              >
                {{ publisher.name }}
              </option>
              <option value="other">Otra</option>
            </select>
            <input
              v-if="showNewPublisherInput"
              v-model="newPublisher"
              type="text"
              placeholder="Nueva editorial"
              class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
          <FormField label="Idioma" :class="{ 'text-red-500': errors.language }" class="md:col-span-1">
            <select
              v-model="form.attributes[4].options[0]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.language }"
              @change="handleLanguageChange"
            >
              <option value="">Seleccionar idioma</option>
              <option
                v-for="language in languages"
                :key="language.id"
                :value="language.name"
              >
                {{ language.name }}
              </option>
              <option value="other">Otro</option>
            </select>
            <input
              v-if="showNewLanguageInput"
              v-model="newLanguage"
              type="text"
              placeholder="Nuevo idioma"
              class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p v-if="errors.language" class="text-red-500 text-sm mt-1">{{ errors.language }}</p>
          </FormField>
        </div>
        <FormField label="Descripción corta" :class="{ 'text-red-500': errors.short_description }" class="mt-6 md:col-span-3">
          <FormControl
            v-model="form.short_description"
            type="textarea"
            placeholder="Descripción corta del libro"
            :class="{ 'border-red-500': errors.short_description }"
            rows="3"
          />
          <p v-if="errors.short_description" class="text-red-500 text-sm mt-1">{{ errors.short_description }}</p>
        </FormField>
        <FormField label="Descripción" :class="{ 'text-red-500': errors.description }" class="mt-6 md:col-span-3">
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiBookOutline } from '@mdi/js';
import SectionMain from '@/components/SectionMain.vue';
import CardBox from '@/components/CardBox.vue';
import FormField from '@/components/FormField.vue';
import FormControl from '@/components/FormControl.vue';
import FormFilePicker from '@/components/FormFilePicker.vue';
import BaseDivider from '@/components/BaseDivider.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseButtons from '@/components/BaseButtons.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import {
  fetchCategories,
  fetchAuthors,
  fetchLanguages,
  fetchPublishers,
  updateProductById,
  uploadProduct,
  createCategory,
  createAuthor,
  createPublisher,
  createLanguage,
  checkSkuExists,
  fetchCategoryByName
} from "@/api/woocommerce";
import { uploadCoverImage, uploadEpubFile } from "@/api/firebase";

const route = useRoute();
const router = useRouter();
const bookData = route.query.bookData ? JSON.parse(route.query.bookData) : null;

const form = reactive({
  name: bookData ? bookData.name : "",
  type: "simple",
  regular_price: bookData ? bookData.regular_price : "",
  sale_price: bookData ? bookData.sale_price : "",
  stock_quantity: bookData ? bookData.stock_quantity : 100,
  manage_stock: true,
  description: bookData ? bookData.description : "",
  short_description: bookData ? bookData.short_description : "",
  categories: bookData ? bookData.categories.map(c => c.id) : [],
  images: bookData ? bookData.images : [],
  attributes: [
    {
      id: 1,
      name: "Autor",
      options: bookData ? [bookData.attributes.find(attr => attr.name === "Autor")?.options[0]] : [""]
    },
    {
      id: 3,
      name: "ISBN",
      options: bookData ? [bookData.attributes.find(attr => attr.name === "ISBN")?.options[0]] : [""]
    },
    {
      id: 4,
      name: "Editorial",
      options: bookData ? [bookData.attributes.find(attr => attr.name === "Editorial")?.options[0]] : [""]
    },
    {
      id: 2,
      name: "Formato",
      options: ["E-book"]
    },
    {
      id: 7,
      name: "Idioma",
      options: bookData ? [bookData.attributes.find(attr => attr.name === "Idioma")?.options[0]] : [""]
    },
    {
      id: 6,
      name: "Encuadernación",
      options: ["Tapa blanda"]
    },
    {
      id: 5,
      name: "Estado",
      options: ["Nuevo"]
    }
  ],
  downloads: bookData ? bookData.downloads : [],
  imageFile: null,
  bookFile: null,
});

const loading = ref(false);
const errors = ref({});
const imagePreview = ref(bookData ? bookData.images[0]?.src : null);
const categories = ref([]);
const authors = ref([]);
const languages = ref([]);
const publishers = ref([]);

const showNewCategoryInput = ref(false);
const newCategory = ref('');
const showNewAuthorInput = ref(false);
const newAuthor = ref('');
const showNewPublisherInput = ref(false);
const newPublisher = ref('');
const showNewLanguageInput = ref(false);
const newLanguage = ref('');

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

const handleCategoryChange = (event) => {
  if (event.target.value === 'other') {
    showNewCategoryInput.value = true;
  } else {
    showNewCategoryInput.value = false;
  }
};

const handleAuthorChange = (event) => {
  if (event.target.value === 'other') {
    showNewAuthorInput.value = true;
  } else {
    showNewAuthorInput.value = false;
  }
};

const handlePublisherChange = (event) => {
  if (event.target.value === 'other') {
    showNewPublisherInput.value = true;
  } else {
    showNewPublisherInput.value = false;
  }
};

const handleLanguageChange = (event) => {
  if (event.target.value === 'other') {
    showNewLanguageInput.value = true;
  } else {
    showNewLanguageInput.value = false;
  }
};

const handleImageChange = (file) => {
  form.imageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleBookFileChange = (file) => {
  form.bookFile = file;
};

const generateUniqueSku = async (baseSku) => {
  let sku = baseSku;
  let suffix = 1;
  while (await checkSkuExists(sku)) {
    sku = `${baseSku}-${suffix}`;
    suffix += 1;
  }
  return sku;
};

const getCategoryId = async (categoryName) => {
  try {
    let category = await fetchCategoryByName(categoryName);
    if (!category) {
      category = await createCategory(categoryName);
    }
    return category.id;
  } catch (error) {
    console.error('Error getting or creating category:', error);
    throw error;
  }
};

const saveBook = async () => {
  if (!validateForm()) return;

  loading.value = true;
  errors.value = {};

  try {
    let imageUrl = form.images[0]?.src;
    let downloadUrl = form.downloads[0]?.file;

    if (form.imageFile) {
      imageUrl = await uploadCoverImage(form.imageFile);
    }

    if (form.bookFile) {
      downloadUrl = await uploadEpubFile(form.bookFile);
    }

    // Generar SKU único
    const baseSku = form.attributes[1].options[0] || `SKU${Date.now()}`;
    const uniqueSku = await generateUniqueSku(baseSku);

    // Manejar nuevas categorías, autores, editoriales e idiomas
    if (showNewCategoryInput.value) {
      const newCategoryId = await getCategoryId(newCategory.value);
      form.categories = [newCategoryId];
    }
    if (showNewAuthorInput.value) {
      await createAuthor(newAuthor.value);
      form.attributes[0].options = [newAuthor.value];
    }
    if (showNewPublisherInput.value) {
      await createPublisher(newPublisher.value);
      form.attributes[2].options = [newPublisher.value];
    }
    if (showNewLanguageInput.value) {
      await createLanguage(newLanguage.value);
      form.attributes[4].options = [newLanguage.value];
    }

    const bookData = {
      name: form.name,
      type: "simple",
      regular_price: form.regular_price.toString(),
      sale_price: form.sale_price.toString(),
      sku: uniqueSku,
      stock_quantity: parseInt(form.stock_quantity),
      manage_stock: true,
      description: form.description,
      short_description: form.short_description,
      categories: form.categories.map(id => ({ id: parseInt(id) })),
      images: [{ src: imageUrl }],
      attributes: form.attributes.map(attr => ({
        id: attr.id,
        name: attr.name,
        position: 0,
        visible: true,
        variation: false,
        options: attr.options
      })),
      virtual: true,
      downloadable: true,
      downloads: [{ name: "Libro Digital", file: downloadUrl }]
    };

    console.log('Sending data to WooCommerce:', JSON.stringify(bookData, null, 2));

    if (route.query.bookData) {
      await updateProductById(JSON.parse(route.query.bookData).id, bookData);
    } else {
      await uploadProduct(bookData);
    }

    alert("Libro guardado correctamente");
    router.push("/books");
  } catch (err) {
    console.error("Error saving book:", err);
    errors.value.general = "Hubo un problema al guardar el libro. Inténtalo de nuevo.";
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  router.push("/books");
};

const buttonLabel = computed(() =>
  route.query.bookData ? "Actualizar Libro" : "Crear Libro"
);

const validateForm = () => {
  errors.value = {};
  if (!form.name) errors.value.name = "El nombre es requerido";
  if (!form.regular_price) errors.value.regular_price = "El precio es requerido";
  if (!form.stock_quantity) errors.value.stock_quantity = "La cantidad en stock es requerida";
  if (!form.categories || form.categories.length === 0) errors.value.categories = "La categoría es requerida";
  if (!form.attributes[0].options[0]) errors.value.author = "El autor es requerido";
  if (!form.attributes[4].options[0]) errors.value.language = "El idioma es requerido";
  if (!form.attributes[1].options[0]) errors.value.isbn = "El ISBN es requerido";
  if (!form.short_description) errors.value.short_description = "La descripción corta es requerida";
  if (!form.description) errors.value.description = "La descripción es requerida";
  
  if (parseFloat(form.sale_price) > parseFloat(form.regular_price)) {
    errors.value.sale_price = "El precio de oferta no puede ser mayor al precio regular";
  }

  return Object.keys(errors.value).length === 0;
};

// Validación activa
watch(form, () => {
  validateForm();
}, { deep: true });
</script>