import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // This block forces the underlying engine to build despite the tsconfig mapping issue
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
