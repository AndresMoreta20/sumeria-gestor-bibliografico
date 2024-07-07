import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@views": resolve(__dirname, "./src/views"),
    },
  },
  server: {
    proxy: {
      "/firebase-storage": {
        target: "https://firebasestorage.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/firebase-storage/, ""),
      },
    },
    cors: true,
  },
});
