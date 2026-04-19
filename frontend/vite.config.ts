import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase/storage")) return "vendor-firebase-storage";
            if (id.includes("firebase"))         return "vendor-firebase";
            if (id.includes("framer-motion"))    return "vendor-motion";
            if (id.includes("@tanstack"))         return "vendor-query";
            if (id.includes("@radix-ui"))         return "vendor-radix";
            if (id.includes("@tiptap") || id.includes("prosemirror")) return "vendor-editor";
            if (id.includes("react-router"))      return "vendor-router";
            if (id.includes("react-dom") || id.includes("/react/")) return "vendor-react";
          }
        },
      },
    },
  },
}));
