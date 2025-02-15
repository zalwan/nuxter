<script setup lang="ts">
import { ref } from "vue";

const file = ref<File | null>(null);
const names = ref("");
const isLoading = ref(false);
const zipUrl = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
  }
};

const handleFormSubmit = async () => {
  if (!file.value) {
    errorMessage.value = "📢 Please upload a PDF file.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;
  zipUrl.value = null;

  try {
    const formData = new FormData();
    formData.append("pdf", file.value);
    formData.append("names", names.value);

    // Fetch data dari API
    const response = await fetch("/api/split", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to process PDF: ${response.statusText}`);
    }

    // Ambil hasil ZIP
    const blob = await response.blob();
    zipUrl.value = URL.createObjectURL(
      new Blob([blob], { type: "application/zip" })
    );
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "An unknown error occurred.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section
    class="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 py-8"
  >
    <div
      class="flex w-full max-w-xl flex-col items-center gap-6 rounded-lg bg-gray-800 p-6 shadow-lg"
    >
      <!-- Icon & Title -->
      <div class="flex flex-col items-center">
        <span class="text-5xl">📑</span>
        <h1 class="mt-2 text-center text-2xl font-bold text-white">
          Split PDF & Download ZIP
        </h1>
      </div>

      <!-- Upload Form -->
      <form @submit.prevent="handleFormSubmit" class="w-full space-y-4">
        <!-- File Upload -->
        <label
          for="pdf"
          class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-500 p-6 text-center text-sm text-gray-400 hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mb-2 w-16 fill-gray-400"
            viewBox="0 0 32 32"
          >
            <path
              d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
            />
            <path
              d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
            />
          </svg>
          <span class="mt-2 text-center text-sm" v-if="file">{{
            file.name
          }}</span>
          <span v-else>Upload PDF File</span>
          <input
            type="file"
            id="pdf"
            class="hidden"
            @change="handleFileUpload"
            accept="application/pdf"
          />
        </label>

        <!-- Names Input -->
        <textarea
          v-model="names"
          rows="4"
          class="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-sm text-white placeholder-gray-400 focus:ring focus:ring-blue-400"
          placeholder="Enter names (one per line)..."
        ></textarea>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-500"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <svg
              class="h-5 w-5 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Processing...
          </span>
          <span v-else>Generate ZIP</span>
        </button>
      </form>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mt-2 w-full rounded-lg bg-red-500 p-3 text-center text-white"
      >
        {{ errorMessage }}
      </div>

      <!-- Download Link -->
      <div v-if="zipUrl" class="mt-4">
        <a
          :href="zipUrl"
          download="split_files.zip"
          class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          📥 Download ZIP
        </a>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-8 text-center text-gray-400">
      🚀 Built with <strong>Nuxt 3</strong> + <strong>Tailwind CSS</strong>
      <br />
      <a
        href="https://github.com/zalwan/pdf-splitter/"
        class="text-blue-400 hover:underline"
        >📜 Source code on GitHub</a
      >
    </footer>
  </section>
</template>
