import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom)[\\/]/,
              priority: 20,
            },
            {
              name: "firebase-auth",
              test: /node_modules[\\/](firebase|@firebase)[\\/]auth[\\/]/,
              priority: 19,
            },
            {
              name: "firebase-firestore",
              test: /node_modules[\\/](firebase|@firebase)[\\/]firestore[\\/]/,
              priority: 18,
            },
            {
              name: "firebase-storage",
              test: /node_modules[\\/](firebase|@firebase)[\\/]storage[\\/]/,
              priority: 17,
            },
            {
              name: "firebase-core",
              test: /node_modules[\\/](firebase|@firebase)[\\/](app|util|component|logger|installations)[\\/]/,
              priority: 16,
            },
            {
              name: "lucide-vendor",
              test: /node_modules[\\/]lucide-react[\\/]/,
              priority: 10,
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              priority: 5,
              minSize: 20000,
            },
          ],
        },
      },
    },
  },
})