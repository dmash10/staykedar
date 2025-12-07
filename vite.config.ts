import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Let Vite automatically handle code splitting to avoid dependency order issues
    // Automatic chunking is smart enough to:
    // - Split vendor code (node_modules) from app code
    // - Create separate chunks for large libraries
    // - Maintain proper loading order
    // Increase chunk size warning limit since we're code-splitting
    chunkSizeWarningLimit: 1000,
  },
}));
