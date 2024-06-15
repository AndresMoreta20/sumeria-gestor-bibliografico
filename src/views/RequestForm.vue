<script setup>
import { reactive, ref } from 'vue';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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
  const date = new Date();
  const timestamp = date.getTime();
  return `SKU${timestamp}`;
};

const submit = async () => {
  loading.value = true;
  try {
    let imageUrl = form.imageUrl;
    let fileUrl = '';

    // Generate a unique SKU
    const sku = generateSKU();
    form.sku = sku;

    // Upload the image file if provided
    if (form.imageFile) {
      const formData = new FormData();
      formData.append('file', form.imageFile);
      formData.append('name', form.imageFile.name);

      const uploadResponse = await axios.post('https://cindyl23.sg-host.com/wp-json/wp/v2/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`
        }
      });

      imageUrl = uploadResponse.data.source_url;
    }

    // Upload the book file if provided
    if (form.file) {
      const fileData = new FormData();
      fileData.append('file', form.file);
      fileData.append('name', form.file.name);

      const uploadResponse = await axios.post('https://cindyl23.sg-host.com/wp-json/wp/v2/media', fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`
        }
      });

      fileUrl = uploadResponse.data.source_url;
    }

    const requestData = {
      title: form.title || 'Frankenstein Prueba Admin',
      format: form.format || 'E-book',
      isbn: form.isbn || '9788498450569',
      category: form.category || '190',
      author: form.author || 'Mary Wollstonecraft Shelley',
      publisher: form.publisher || 'ALGAR EDITORIAL',
      language: form.language || 'Español',
      regularPrice: form.regularPrice || '10',
      salePrice: form.salePrice || '8',
      shortDescription: form.shortDescription || 'En la novela, el Monstruo aparece como una criatura humanoide de enorme estatura.',
      description: form.description || 'En la novela, el Monstruo aparece como una criatura humanoide de enorme estatura.',
      imageUrl: imageUrl || 'https://i0.wp.com/cindyl23.sg-host.com/wp-content/uploads/2024/06/Frankenstein.webp?fit=220%2C360&ssl=1',
      fileUrl: fileUrl || 'https://cindyl23.sg-host.com/wp-content/uploads/woocommerce_uploads/2024/06/Frankenstein-o-el-moderno-Prometeo-libro-9qxjrx.pdf',
      stockQuantity: form.stockQuantity,
      sku: form.sku,
      status: 'pending'
    };

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const requestRef = collection(db, 'bookRequests');
      await addDoc(requestRef, {
        ...requestData,
        userEmail: user.email
      });
      alert('Request submitted successfully');
      router.push('/requests'); // Replace with the actual path you want to redirect to
    } else {
      alert('You must be logged in to submit a request');
    }
  } catch (error) {
    console.error('Error creating request:', error.response?.data || error);
    alert('Error creating request');
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  router.push('/requests'); // Replace with the actual path you want to go back to
};
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBallotOutline" title="Create New Request" main>
      </SectionTitleLineWithButton>
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
