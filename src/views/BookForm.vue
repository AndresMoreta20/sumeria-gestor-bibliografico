<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';
import SectionMain from '@/components/SectionMain.vue';
import CardBox from '@/components/CardBox.vue';
import FormField from '@/components/FormField.vue';
import FormControl from '@/components/FormControl.vue';
import BaseDivider from '@/components/BaseDivider.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseButtons from '@/components/BaseButtons.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;

const form = reactive({
  title: '',
  format: 'E-book',
  file: null,
  isbn: '',
  category: '',
  author: '',
  publisher: '',
  language: '',
  regularPrice: '',
  salePrice: '',
  shortDescription: '',
  description: '',
  imageUrl: '',
  imageFile: null,
  stockQuantity: 100,
  sku: ''
});

const loading = ref(false);

const generateSKU = () => {
  const timestamp = new Date().getTime();
  return `SKU${timestamp}`;
};

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', file.name);
  const response = await axios.post('https://cindyl23.sg-host.com/wp-json/wp/v2/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`
    }
  });
  return response.data.source_url;
};

const submit = async () => {
  loading.value = true;
  try {
    form.sku = generateSKU();

    let imageUrl = form.imageUrl;
    let fileUrl = '';

    if (form.imageFile) {
      imageUrl = await uploadFile(form.imageFile);
    }

    if (form.file) {
      fileUrl = await uploadFile(form.file);
    }

    const data = {
      name: form.title || 'Frankenstein Prueba Admin',
      type: 'simple',
      regular_price: form.regularPrice || '10',
      sale_price: form.salePrice || '8',
      sku: form.sku,
      stock_quantity: form.stockQuantity,
      manage_stock: true,
      description: form.description || '<p>En la novela, el Monstruo aparece como una criatura humanoide de enorme estatura.</p>',
      short_description: form.shortDescription || '<p>En la novela, el Monstruo aparece como una criatura humanoide de enorme estatura.</p>',
      categories: form.category ? [{ id: form.category }] : [{ id: 190 }, { id: 205 }],
      images: [{ src: imageUrl || 'https://i0.wp.com/cindyl23.sg-host.com/wp-content/uploads/2024/06/Frankenstein.webp?fit=220%2C360&ssl=1' }],
      attributes: [
        { id: 1, name: 'Autor', options: [form.author || 'Mary Wollstonecraft Shelley'] },
        { id: 3, name: 'ISBN', options: [form.isbn || '9788498450569'] },
        { id: 4, name: 'Editorial', options: [form.publisher || 'ALGAR EDITORIAL'] },
        { id: 2, name: 'Formato', options: [form.format || 'E-book'] },
        { id: 7, name: 'Idioma', options: [form.language || 'Español'] },
        { id: 6, name: 'Encuadernación', options: ['Tapa blanda'] },
        { id: 5, name: 'Estado', options: ['Nuevo'] }
      ],
      downloads: [
        { name: 'Frankenstein Digital', file: fileUrl || 'https://cindyl23.sg-host.com/wp-content/uploads/woocommerce_uploads/2024/06/Frankenstein-o-el-moderno-Prometeo-libro-9qxjrx.pdf' }
      ]
    };

    const response = await axios.post('https://cindyl23.sg-host.com/wp-json/wc/v3/products', data, {
      auth: {
        username: consumerKey,
        password: consumerSecret
      }
    });

    console.log('Book created successfully:', response.data);
    alert('Book created successfully');
    router.push('/books'); // Replace with the actual path you want to redirect to
  } catch (error) {
    console.error('Error creating book:', error.response?.data || error);
    alert('Error creating book');
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  router.push('/books'); // Replace with the actual path you want to go back to
};
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBallotOutline" title="Add New Book" main />
      <CardBox form @submit.prevent="submit">
        <FormField label="Cover">
          <FormControl v-model="form.imageUrl" type="text" placeholder="Image URL (or upload a file)" />
          <input type="file" @change="e => form.imageFile = e.target.files[0]" class="mt-2" />
        </FormField>
        <FormField label="Format">
          <FormControl v-model="form.format" type="text" placeholder="E-book" />
        </FormField>
        <FormField label="File">
          <input type="file" @change="e => form.file = e.target.files[0]" class="mt-2" />
        </FormField>
        <BaseDivider />
        <FormField label="ISBN">
          <FormControl v-model="form.isbn" type="text" placeholder="9788498450569" />
        </FormField>
        <FormField label="Title">
          <FormControl v-model="form.title" type="text" placeholder="Frankenstein Prueba Admin" />
        </FormField>
        <FormField label="Category">
          <FormControl v-model="form.category" type="text" placeholder="190" />
        </FormField>
        <FormField label="Author">
          <FormControl v-model="form.author" type="text" placeholder="Mary Wollstonecraft Shelley" />
        </FormField>
        <FormField label="Publisher">
          <FormControl v-model="form.publisher" type="text" placeholder="ALGAR EDITORIAL" />
        </FormField>
        <FormField label="Language">
          <FormControl v-model="form.language" type="text" placeholder="Español" />
        </FormField>
        <FormField label="Regular Price ($)">
          <FormControl v-model="form.regularPrice" type="text" placeholder="10" />
        </FormField>
        <FormField label="Sale Price ($)">
          <FormControl v-model="form.salePrice" type="text" placeholder="8" />
        </FormField>
        <FormField label="Short Description">
          <FormControl v-model="form.shortDescription" type="textarea" placeholder="En la novela, el Monstruo aparece como una criatura humanoide de enorme estatura." />
        </FormField>
        <FormField label="Description">
          <FormControl v-model="form.description" type="textarea" placeholder="En la novela, el Monstruo aparece como una criatura humanoide de enorme estatura." />
        </FormField>
        <template #footer>
          <BaseButtons>
            <BaseButton v-if="!loading" @click="submit" color="success" label="Save" />
            <BaseButton v-if="loading" color="success" label="Saving..." disabled />
            <BaseButton @click="cancel" color="danger" label="Cancel" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
