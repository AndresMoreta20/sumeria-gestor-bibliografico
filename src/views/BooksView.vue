<script setup>
import { ref, onMounted } from "vue";
import { mdiBook } from "@mdi/js";
import SectionMain from "@/components/SectionMain.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import CardBox from "@/components/CardBox.vue";
import TableBooks from "@/components/TableBooks.vue";
import BookDetail from "@/components/BookDetail.vue";
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import CardBoxModal from '@/components/CardBoxModal.vue';
import { fetchBooks } from '@/api/woocommerce';

const books = ref([]);
const selectedBookId = ref(null);
const loading = ref(true);

const loadBooks = async () => {
  try {
    loading.value = true;
    books.value = await fetchBooks();
  } catch (error) {
    console.error("Error fetching books:", error);
  } finally {
    loading.value = false;
  }
};

const viewBook = (bookId) => {
  selectedBookId.value = bookId;
};

const closeDetailView = () => {
  selectedBookId.value = null;
};

onMounted(loadBooks);
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBook" title="Libros" main>
        <!-- Optional button can go here -->
      </SectionTitleLineWithButton>

      <CardBox class="mb-6" has-table>
        <template v-if="loading">
          <LoadingIndicator />
        </template>
        <template v-else-if="selectedBookId">
          <BookDetail :book-id="selectedBookId" @close="closeDetailView" />
        </template>
        <template v-else>
          <TableBooks :books="books" @view-book="viewBook" />
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
